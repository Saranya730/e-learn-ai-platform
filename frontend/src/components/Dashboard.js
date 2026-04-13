import React, { useState, useEffect } from "react";
import AIChat from "./AIChat";
import TutorList from "./TutorList";
import TutorDetails from "./TutorDetails";
import StarRating from "./StarRating";
import { useLocation } from "react-router-dom";
import axios from "axios";


function Dashboard() {
  const location = useLocation();
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [activeEnrollment, setActiveEnrollment] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newDoubt, setNewDoubt] = useState("");
  const [dailyFeedback, setDailyFeedback] = useState("");
  const [finalRating, setFinalRating] = useState(5);
  const [finalReview, setFinalReview] = useState("");

  const [availableCourses, setAvailableCourses] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [globalTutors, setGlobalTutors] = useState([]);

  useEffect(() => {
    fetchMyCourses();
    fetchAvailableCourses();
    fetchAllTutors();
  }, []);

  const fetchAllTutors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/tutor/all-tutors', {
          headers: { Authorization: `Bearer ${token}` }
      });
      setGlobalTutors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get('view');
    if (view) {
      setActiveView(view);
    } else {
      setActiveView('dashboard');
    }
  }, [location.search]);

  const fetchAvailableCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/courses");
      setAvailableCourses(res.data);
      setLoadingAvailable(false);
    } catch (error) {
      console.error("Error fetching available courses:", error);
      setLoadingAvailable(false);
    }
  };

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get("http://localhost:5000/api/enrollment/my-courses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyCourses(res.data);
      setLoadingCourses(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setLoadingCourses(false);
    }
  };

  const loadRazorpay = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (amount, courseTitle, tutorId) => {
    const res = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    try {
      const keyResponse = await axios.get("http://localhost:5000/api/payment/key");
      const rzpKey = keyResponse.data.key;

      const result = await axios.post("http://localhost:5000/api/payment/order", { amount });
      const { amount: orderAmount, id: order_id, currency } = result.data;

      const options = {
        key: rzpKey,
        amount: orderAmount.toString(),
        currency: currency,
        name: "E-Learn Platform",
        description: `Payment for ${courseTitle}`,
        order_id: order_id,
        handler: async function (response) {
          try {
            const token = localStorage.getItem('token');
            await axios.post("http://localhost:5000/api/enrollment/join", {
              tutorId,
              courseTitle,
              amount,
              paymentId: response.razorpay_payment_id
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            alert("Enrollment Successful! Waiting for tutor approval. ✅");
            fetchMyCourses();
            setActiveView('my-courses');
          } catch (err) {
            alert("Payment successful but enrollment failed. Contact support.");
          }
        },
        theme: { color: "#2563eb" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      alert("Payment Initiation Failed");
    }
  };

  const updateProgress = async (enrollId, materialId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/enrollment/update-status/${enrollId}/${materialId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyCourses(); // Refresh
      // Update local state if in classroom
      const updated = await axios.get(`http://localhost:5000/api/enrollment/my-courses`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      const current = updated.data.find(e => e._id === enrollId);
      setActiveEnrollment(current);
    } catch (err) { alert("Failed to update status"); }
  };

  const submitDoubt = async (enrollId, materialId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/enrollment/doubt/${enrollId}/${materialId}`, { question: newDoubt }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewDoubt("");
      alert("Doubt submitted! Tutor will reply soon.");
      const updated = await axios.get(`http://localhost:5000/api/enrollment/my-courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const current = updated.data.find(e => e._id === enrollId);
      setActiveEnrollment(current);
      fetchMyCourses();
    } catch (err) { alert("Failed to submit doubt"); }
  };

  const submitFinalRating = async (enrollId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/enrollment/final-rating/${enrollId}`, { rating: finalRating, review: finalReview }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Course completed! Thank you for your feedback.");
      setActiveView('dashboard');
      fetchMyCourses();
    } catch (err) { alert("Failed to submit rating"); }
  };

  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
    setActiveView('tutor-details');
  };

  const renderContent = () => {
    switch (activeView) {
      case "classroom":
        if (!activeEnrollment) return <div>No enrollment selected</div>;
        const currentMaterial = selectedDay ? activeEnrollment.materials.find(m => m.dayNumber === selectedDay) : activeEnrollment.materials[0];
        
        return (
          <div className="classroom-container">
            <div className="classroom-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', background: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
                <div>
                    <button onClick={() => setActiveView('my-courses')} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer', marginBottom: '8px' }}>← Back to Courses</button>
                    <h2 style={{ margin: 0 }}>{activeEnrollment.courseTitle}</h2>
                </div>
                <div style={{ textAlign: 'right', minWidth: '200px' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-500)', marginBottom: '4px' }}>Course Progress: {activeEnrollment.progress}%</div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--slate-100)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${activeEnrollment.progress}%`, height: '100%', background: 'var(--success)', transition: '0.5s' }}></div>
                    </div>
                </div>
            </div>

            <div className="classroom-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-6)' }}>
                {/* Timeline Sidebar */}
                <aside className="classroom-sidebar card" style={{ padding: 'var(--space-4)' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Study Timeline</h3>
                    <div className="days-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeEnrollment.materials.sort((a,b) => a.dayNumber - b.dayNumber).map(m => (
                            <button 
                                key={m._id}
                                onClick={() => setSelectedDay(m.dayNumber)}
                                className={`day-btn ${selectedDay === m.dayNumber ? 'active' : ''} ${m.status === 'completed' ? 'done' : ''}`}
                                style={{ 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--slate-100)', 
                                    background: selectedDay === m.dayNumber ? 'var(--primary-600)' : m.status === 'completed' ? 'var(--success-50)' : 'white',
                                    color: selectedDay === m.dayNumber ? 'white' : 'var(--slate-800)',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>Week {m.dayNumber}: {m.title.substring(0, 15)}...</span>
                                {m.status === 'completed' && <span style={{ color: selectedDay === m.dayNumber ? 'white' : 'var(--success)' }}>✓</span>}
                            </button>
                        ))}
                        {activeEnrollment.materials.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>No materials uploaded yet.</p>}
                    </div>

                    {activeEnrollment.totalPoints > 0 && (
                        <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--success-50)', border: '1px solid var(--success-100)', borderRadius: 'var(--radius-lg)' }}>
                            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: 'var(--success)' }}>Performance Points ⭐</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--success-700)' }}>{activeEnrollment.totalPoints}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: 'var(--success-600)' }}>Awarded by Tutor</p>
                        </div>
                    )}

                    {activeEnrollment.progress === 100 && !activeEnrollment.isCompleted && (
                        <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-4)', background: 'var(--primary-50)', borderRadius: 'var(--radius-lg)' }}>
                            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-700)' }}>Course Finished! 🎉</p>
                            <button onClick={() => setActiveView('final-rating')} className="join-btn" style={{ width: '100%', marginTop: '8px' }}>Give Final Rating</button>
                        </div>
                    )}
                </aside>

                {/* Main Content */}
                <main className="classroom-main card" style={{ padding: 'var(--space-8)' }}>
                    {currentMaterial ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-600)', textTransform: 'uppercase' }}>Week {currentMaterial.dayNumber}</span>
                                    <h2 style={{ fontSize: '1.75rem', margin: '4px 0 0 0' }}>{currentMaterial.title}</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {currentMaterial.status !== 'completed' ? (
                                        <button 
                                            onClick={() => updateProgress(activeEnrollment._id, currentMaterial._id, 'completed')}
                                            className="join-btn" 
                                            style={{ background: 'var(--success)' }}
                                        >
                                            Mark as Completed ✓
                                        </button>
                                    ) : (
                                        <span style={{ background: 'var(--success)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 700 }}>Lesson Completed ✓</span>
                                    )}
                                </div>
                            </div>

                            <div className="material-viewer" style={{ background: 'var(--slate-50)', padding: 'var(--space-10)', borderRadius: 'var(--radius-xl)', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📄</div>
                                <p style={{ color: 'var(--slate-600)', fontWeight: 600 }}>Lesson Material: {currentMaterial.title}</p>
                                <a href={currentMaterial.fileUrl} target="_blank" rel="noopener noreferrer" className="view-details-btn-small" style={{ marginTop: '12px', background: 'var(--primary-600)', color: 'white', padding: '10px 20px' }}>Open Document →</a>
                            </div>

                            <div className="interaction-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                                <div className="feedback-section">
                                    <h4>Your Daily Feedback</h4>
                                    {currentMaterial.feedback ? (
                                        <div style={{ background: 'var(--slate-50)', padding: '12px', borderRadius: '8px', fontStyle: 'italic', fontSize: '0.9rem' }}>"{currentMaterial.feedback}"</div>
                                    ) : (
                                        <>
                                            <textarea 
                                                placeholder="Was today's lesson useful?"
                                                value={dailyFeedback}
                                                onChange={(e) => setDailyFeedback(e.target.value)}
                                                style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', border: '1px solid var(--slate-200)', marginBottom: '8px' }}
                                            />
                                            <button 
                                                onClick={async () => {
                                                    const token = localStorage.getItem('token');
                                                    await axios.put(`http://localhost:5000/api/enrollment/feedback/${activeEnrollment._id}/${currentMaterial._id}`, { feedback: dailyFeedback }, { headers: { Authorization: `Bearer ${token}` } });
                                                    alert("Feedback saved!");
                                                    setDailyFeedback("");
                                                    fetchMyCourses();
                                                }}
                                                className="view-details-btn-small"
                                            >Submit Response</button>
                                        </>
                                    )}
                                </div>

                                <div className="doubts-section">
                                    <h4>Questions & Doubts</h4>
                                    <div className="doubts-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
                                        {currentMaterial.doubts.map((d, i) => (
                                            <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--slate-100)' }}>
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem' }}>Q: {d.question}</p>
                                                {d.answer ? (
                                                    <p style={{ margin: '4px 0 0 0', color: 'var(--primary-700)', fontSize: '0.875rem', background: 'var(--primary-50)', padding: '8px', borderRadius: '4px' }}><strong>A:</strong> {d.answer}</p>
                                                ) : (
                                                    <p style={{ margin: '4px 0 0 0', color: 'var(--slate-400)', fontSize: '0.75rem', fontStyle: 'italic' }}>Waiting for tutor's reply...</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Ask a question..." 
                                            value={newDoubt}
                                            onChange={(e) => setNewDoubt(e.target.value)}
                                            style={{ flexGrow: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}
                                        />
                                        <button onClick={() => submitDoubt(activeEnrollment._id, currentMaterial._id)} className="join-btn">Ask</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 'var(--space-20)' }}>
                            <h3>Welcome to your Classroom</h3>
                            <p style={{ color: 'var(--slate-500)' }}>Select a week from the sidebar to begin your study.</p>
                        </div>
                    )}
                </main>
            </div>
          </div>
        );

      case "final-rating":
        return (
            <div className="card" style={{ maxWidth: '600px', margin: 'var(--space-20) auto', textAlign: 'center', padding: 'var(--space-10)', borderTop: '8px solid var(--primary-600)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⭐</div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '12px' }}>Congratulations!</h2>
                <p style={{ color: 'var(--slate-500)', fontSize: '1.1rem', marginBottom: 'var(--space-10)', lineHeight: 1.6 }}>
                  You've successfully finished <strong>{activeEnrollment.courseTitle}</strong>.<br/> 
                  Please share your review and rate your tutor!
                </p>
                
                <div style={{ marginBottom: 'var(--space-10)', background: 'var(--slate-50)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)' }}>
                    <p style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '20px', color: 'var(--slate-800)' }}>Overall Tutor Rating</p>
                    <StarRating value={finalRating} onChange={setFinalRating} size="3.5rem" />
                    <p style={{ marginTop: '16px', fontWeight: 900, fontSize: '1.5rem', color: '#fbbf24' }}>{finalRating} <span style={{ fontSize: '1rem', color: 'var(--slate-400)' }}>/ 5.0</span></p>
                </div>

                <div style={{ textAlign: 'left', marginBottom: 'var(--space-8)' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: 'var(--slate-700)' }}>Your Learning Experience</label>
                  <textarea 
                      placeholder="What did you think of this course and tutor?"
                      value={finalReview}
                      onChange={(e) => setFinalReview(e.target.value)}
                      style={{ width: '100%', minHeight: '150px', padding: '16px', borderRadius: '16px', border: '2px solid var(--slate-100)', fontSize: '1rem', transition: '0.3s' }}
                  />
                </div>

                <button 
                  onClick={() => submitFinalRating(activeEnrollment._id)} 
                  className="join-btn" 
                  style={{ width: '100%', padding: '20px', fontSize: '1.25rem', borderRadius: '16px', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary-600), var(--primary-500))', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)' }}
                >
                  Submit & Complete Course 🚀
                </button>
            </div>
        );

      case "chat":
        return <AIChat />;
      case "tutors":
        return <TutorList onSelectTutor={handleSelectTutor} />;
      case "tutor-details":
        return (
          <TutorDetails
            tutor={selectedTutor}
            courses={availableCourses.filter(c => c.instructor === selectedTutor.name)}
            onBack={() => setActiveView('tutors')}
            onPay={(amt, title) => handlePayment(amt, title, selectedTutor.userId || selectedTutor._id)}
          />
        );
      case "my-courses":
        return (
          <div className="recommendation">
            <div className="section-header">
              <h3>📖 My Enrolled Courses</h3>
            </div>
            <div className="course-list">
              {myCourses.length === 0 ? (
                <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: 'var(--space-10)', color: 'var(--slate-500)' }}>No courses joined yet.</p>
              ) : myCourses.map(course => (
                <div key={course._id} className="course-card">
                  <div className="course-card-content">
                    <h4>{course.courseTitle}</h4>
                    <p>Tutor: <strong>{course.tutorId?.name || 'Assigned Tutor'}</strong></p>
                    <div style={{ marginTop: 'var(--space-4)' }}>
                      <span className={`status-badge status-${course.status}`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                   <div className="course-footer" style={{ flexDirection: 'column', gap: '12px' }}>
                    {course.status === 'approved' ? (
                      <>
                        {course.isCompleted ? (
                             <div style={{ textAlign: 'center', width: '100%' }}>
                                <span style={{ background: 'var(--primary-50)', color: 'var(--primary-700)', padding: '6px 12px', borderRadius: 'full', fontWeight: 800, fontSize: '0.75rem' }}>COURSE COMPLETED 🎓</span>
                                <div style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--success)', fontWeight: 700 }}>Total Points Earned: {course.totalPoints}</div>
                             </div>
                        ) : (
                            <button 
                                onClick={() => { setActiveEnrollment(course); setActiveView('classroom'); }} 
                                className="join-btn" 
                                style={{ background: 'var(--success)', width: '100%' }}
                            >
                                Enter Classroom
                            </button>
                        )}
                        
                        <div className="student-materials-box" style={{ width: '100%', textAlign: 'left', background: 'var(--slate-50)', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-700)' }}>Study Progress 📊</p>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-600)' }}>{course.progress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'var(--slate-200)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${course.progress}%`, height: '100%', background: 'var(--primary-600)', transition: '0.5s' }}></div>
                            </div>
                        </div>
                      </>
                    ) : (
                      <p className="wait-msg" style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontStyle: 'italic', margin: 0 }}>Waiting for tutor approval...</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className="cards">
              <div className="card-modern stat-course">
                <div className="card-icon">📚</div>
                <div className="card-info">
                  <h3>Total Courses</h3>
                  <p>{availableCourses.length}</p>
                </div>
              </div>
              <div className="card-modern stat-enroll">
                <div className="card-icon">📖</div>
                <div className="card-info">
                  <h3>Enrolled</h3>
                  <p>{myCourses.length}</p>
                </div>
              </div>
              
              {/* Activity Feed Case */}
              <div className="card-modern recent-activities" style={{ gridColumn: 'span 2', flex: 1 }}>
                <div className="card-info" style={{ width: '100%' }}>
                  <h3>Recent Notifications & Feedback</h3>
                  <div className="activity-feed" style={{ marginTop: '12px', maxHeight: '100px', overflowY: 'auto' }}>
                    {(() => {
                      const notifications = [];
                      myCourses.forEach(c => {
                        // Nudges
                        if (c.lastNudgeAt) {
                          notifications.push({
                            type: 'NUDGE',
                            msg: `Tutor nudge for "${c.courseTitle}"`,
                            time: new Date(c.lastNudgeAt),
                            color: 'var(--danger)'
                          });
                        }
                        // Doubt Replies
                        c.materials.forEach(m => {
                          m.doubts.forEach(d => {
                            if (d.answeredAt) {
                              notifications.push({
                                type: 'REPLY',
                                msg: `Doubt reply for Week ${m.dayNumber}: "${d.answer?.substring(0, 30) || ''}..."`,
                                time: new Date(d.answeredAt),
                                color: 'var(--primary-600)'
                              });
                            }
                          });
                        });
                        // Marks/Points
                        if (c.totalPoints > 0) {
                          notifications.push({
                            type: 'MARKS',
                            msg: `Marks/Points update for "${c.courseTitle}": ${c.totalPoints} pts`,
                            time: new Date(c.updatedAt),
                            color: 'var(--success)'
                          });
                        }
                      });

                      if (notifications.length === 0) return <p style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>No recent notifications.</p>;

                      return notifications.sort((a,b) => b.time - a.time).slice(0, 3).map((n, i) => (
                        <div key={i} className="notif-pill" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.8125rem', padding: '6px 12px', background: 'var(--slate-50)', borderRadius: '20px', border: '1px solid var(--slate-100)' }}>
                          <span style={{ color: n.color, fontWeight: 900, minWidth: '60px' }}>[{n.type}]</span>
                          <span style={{ color: 'var(--slate-700)', fontWeight: 600 }}>{n.msg}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="recommendation">
              <div className="section-header">
                <h3>📚 Available Courses</h3>
                <button
                  onClick={() => setActiveView('tutors')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary-600)', fontWeight: 600, cursor: 'pointer' }}
                >
                  View All Tutors →
                </button>
              </div>
              <div className="course-list">
                {availableCourses.length === 0 ? (
                  <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: 'var(--space-12)', color: 'var(--slate-400)' }}>
                    No courses available at the moment. Check back later!
                  </p>
                ) : availableCourses.map(course => (
                  <div key={course._id} className="course-card">
                    <div className="course-card-content">
                      <h4 style={{ marginBottom: '8px', fontSize: '1.25rem', color: 'var(--slate-900)' }}>{course.title}</h4>
                      <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 var(--space-4) 0' }}>{course.description.substring(0, 100)}...</p>
                      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                        <span style={{ fontSize: '0.75rem', background: 'var(--slate-100)', padding: '4px 10px', borderRadius: '4px', fontWeight: 600, color: 'var(--slate-600)' }}>⏱ {course.duration}</span>
                        <span style={{ fontSize: '0.75rem', background: 'var(--slate-100)', padding: '4px 10px', borderRadius: '4px', fontWeight: 600, color: 'var(--slate-600)' }}>⭐ 4.8</span>
                      </div>
                    </div>
                    <div className="course-footer" style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--slate-50)', borderTop: '1px solid var(--slate-100)' }}>
                      <span className="price" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>₹{course.price}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="view-details-btn-small"
                          onClick={() => setSelectedCourse(course)}
                        >
                          View Details
                        </button>
                        <button
                          className="join-btn"
                          onClick={() => {
                            const tutor = globalTutors.find(t => t.name === course.instructor);
                            handlePayment(course.price, course.title, tutor ? (tutor.userId || tutor._id) : "65d8c1e2e4b0a1b2c3d4e5f6");
                          }}
                        >
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Course Details Modal */}
              {selectedCourse && (
                  <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
                      <div className="modal-content-premium" onClick={e => e.stopPropagation()}>
                          <button className="modal-close" onClick={() => setSelectedCourse(null)}>&times;</button>
                          <div className="modal-header-accent"></div>
                          <div className="modal-inner">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                                  <div>
                                      <h2 style={{ fontSize: '1.75rem', color: 'var(--slate-900)', marginBottom: '8px' }}>{selectedCourse.title}</h2>
                                      <p style={{ color: 'var(--primary-600)', fontWeight: 700, fontSize: '1.1rem' }}>Available for Enrollment</p>
                                      <div 
                                        style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', display: 'inline-flex' }}
                                        className="tutor-profile-link"
                                        onClick={() => {
                                            const tutor = globalTutors.find(t => t.name === selectedCourse.instructor);
                                            if (tutor) {
                                                handleSelectTutor(tutor);
                                                setSelectedCourse(null);
                                            }
                                        }}
                                      >
                                          <span style={{background: 'var(--primary-100)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-700)', fontWeight: 'bold'}}>{selectedCourse.instructor?.charAt(0) || 'T'}</span>
                                          <span>Taught by <strong style={{color: 'var(--primary-600)'}}>{selectedCourse.instructor}</strong></span>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', marginLeft: '4px', textDecoration: 'underline' }}>View Profile →</span>
                                      </div>
                                  </div>
                                  <div className="modal-price-badge">₹{selectedCourse.price}</div>
                              </div>

                              <div className="details-grid-premium">
                                  <div className="details-main-info">
                                      <h4 style={{ color: 'var(--slate-800)', marginBottom: '12px' }}>Course Description</h4>
                                      <p style={{ color: 'var(--slate-600)', lineHeight: 1.6, fontSize: '0.95rem' }}>{selectedCourse.description}</p>
                                      
                                      <h4 style={{ color: 'var(--slate-800)', marginTop: '24px', marginBottom: '12px' }}>What you will learn</h4>
                                      <div className="skills-grid-modal">
                                          {selectedCourse.skills?.map((skill, i) => (
                                              <div key={i} className="skill-check-item">
                                                  <span className="check-icon">✓</span> {skill}
                                              </div>
                                          ))}
                                          {(!selectedCourse.skills || selectedCourse.skills.length === 0) && (
                                              <p style={{ color: 'var(--slate-500)', fontStyle: 'italic', fontSize: '0.875rem' }}>Skills not specified.</p>
                                          )}
                                      </div>
                                  </div>
                                  <div className="details-sidebar-info">
                                      <div className="sidebar-stat-box">
                                          <span className="lbl">Duration</span>
                                          <span className="val">{selectedCourse.duration}</span>
                                      </div>
                                      <div className="sidebar-stat-box">
                                          <span className="lbl">Rating</span>
                                          <span className="val">⭐ 4.8 / 5.0</span>
                                      </div>
                                      <div className="sidebar-stat-box">
                                          <span className="lbl">Level</span>
                                          <span className="val">Professional</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div className="modal-footer-premium">
                              <button onClick={() => setSelectedCourse(null)} className="close-action-btn" style={{ marginRight: '16px' }}>Close</button>
                              <button 
                                className="join-btn" 
                                style={{ padding: '10px 24px', fontSize: '1rem' }}
                                onClick={() => {
                                  const tutor = globalTutors.find(t => t.name === selectedCourse.instructor);
                                  handlePayment(selectedCourse.price, selectedCourse.title, tutor ? (tutor.userId || tutor._id) : "65d8c1e2e4b0a1b2c3d4e5f6");
                                  setSelectedCourse(null);
                                }}
                              >
                                Enroll Now
                              </button>
                          </div>
                      </div>
                  </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <>
      <style>{`
        .dashboard-container {
          min-height: calc(100vh - var(--header-height));
          background: var(--slate-50);
          max-width: 1440px;
          margin: 0 auto;
          display: block;
        }
        
        /* Main Content */
        .main-content {
          padding: var(--space-8) var(--space-8);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-10);
        }

        .header h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--slate-900);
          letter-spacing: -0.025em;
        }

        .user-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .logout-btn {
          padding: var(--space-2) var(--space-5);
          background: white;
          border: 1px solid var(--slate-200);
          color: var(--slate-700);
          border-radius: var(--radius-lg);
          cursor: pointer;
          font-weight: 600;
          transition: var(--transition-base);
        }

        .logout-btn:hover {
          background: var(--danger);
          color: white;
          border-color: var(--danger);
        }
        
        /* Dashboard Content Components */
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-12);
        }

        .card {
          background: white;
          padding: var(--space-6);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--slate-100);
          transition: var(--transition-base);
        }

        .card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .card-modern {
          background: white;
          padding: var(--space-6);
          border-radius: var(--radius-2xl);
          border: 1px solid var(--slate-100);
          display: flex;
          align-items: center;
          gap: var(--space-5);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          position: relative;
          overflow: hidden;
        }

        .card-modern:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 20px -8px rgba(0,0,0,0.08);
          border-color: var(--primary-200);
        }

        .card-icon {
          width: 56px;
          height: 56px;
          background: var(--slate-50);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          transition: 0.3s;
        }

        .card-modern:hover .card-icon {
          background: var(--primary-600);
          color: white;
          transform: scale(1.1) rotate(-5deg);
        }

        .card-info h3 {
          color: var(--slate-500);
          font-size: 0.75rem;
          margin: 0 0 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
        }

        .card-info p {
          font-size: 1.75rem;
          font-weight: 900;
          color: var(--slate-900);
          margin: 0;
          line-height: 1.1;
        }

        .stat-course { border-left: 4px solid var(--info); }
        .stat-enroll { border-left: 4px solid var(--success); }
        .stat-session { border-left: 4px solid var(--warning); }
        .stat-points { border-left: 4px solid var(--primary-600); }
        
        /* Courses Section */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-6);
        }

        .section-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--slate-900);
        }

        .course-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-8);
        }

        .course-card {
          background: white;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--slate-100);
          transition: var(--transition-base);
          display: flex;
          flex-direction: column;
        }

        .course-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
        }

        .course-card-content {
          padding: var(--space-6);
          flex-grow: 1;
        }

        .course-card h4 {
          margin: 0 0 8px 0;
          color: var(--slate-900);
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .course-card p {
          color: var(--slate-500);
          margin-bottom: var(--space-4);
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .course-footer {
          padding: var(--space-4) var(--space-6);
          background: var(--slate-50);
          border-top: 1px solid var(--slate-100);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .price {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--primary-600);
        }

        .join-btn {
          padding: 10px 24px;
          background: linear-gradient(135deg, var(--primary-600), var(--primary-500));
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.3s ease;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .join-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(79, 70, 229, 0.3);
          background: linear-gradient(135deg, var(--primary-700), var(--primary-600));
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-pending { background: var(--primary-100); color: var(--primary-700); }
        .status-approved { background: var(--success); color: white; }
        .status-rejected { background: var(--danger); color: white; }

        /* Modal Styles */
        .view-details-btn-small { background: none; border: 1px solid var(--primary-600); color: var(--primary-600); padding: 8px 16px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 0.85rem; }
        .view-details-btn-small:hover { background: var(--primary-50); transform: translateY(-1px); }
        
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .modal-content-premium { background: white; width: 100%; max-width: 850px; border-radius: 32px; overflow: hidden; position: relative; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes modalIn { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .modal-close { position: absolute; top: 20px; right: 28px; background: none; border: none; font-size: 2rem; color: var(--slate-400); cursor: pointer; z-index: 10; transition: 0.2s; }
        .modal-close:hover { color: var(--slate-900); transform: rotate(90deg); }
        .modal-header-accent { height: 8px; background: linear-gradient(90deg, var(--primary-500), var(--primary-700)); }
        .modal-inner { padding: var(--space-10); max-height: 80vh; overflow-y: auto; }
        .modal-price-badge { background: var(--success-50); color: var(--success); padding: 8px 20px; border-radius: 12px; font-weight: 900; font-size: 1.25rem; }
        
        .details-grid-premium { display: grid; grid-template-columns: 1fr 280px; gap: var(--space-10); margin-top: var(--space-8); border-top: 2px solid var(--slate-50); padding-top: var(--space-8); }
        .details-sidebar-info { display: flex; flex-direction: column; gap: 16px; }
        .sidebar-stat-box { background: var(--slate-50); padding: 20px; border-radius: 20px; border: 1px solid var(--slate-100); }
        .sidebar-stat-box .lbl { font-size: 0.7rem; font-weight: 800; color: var(--slate-400); text-transform: uppercase; display: block; margin-bottom: 4px; }
        .sidebar-stat-box .val { font-size: 1.1rem; font-weight: 800; color: var(--slate-900); }
        
        .skills-grid-modal { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .skill-check-item { background: var(--primary-50); color: var(--primary-800); padding: 10px 16px; border-radius: 16px; font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .check-icon { color: var(--success); font-weight: 800; }
        
        .modal-footer-premium { padding: var(--space-6) var(--space-10); background: var(--slate-50); border-top: 1px solid var(--slate-100); display: flex; justify-content: flex-end; }
        .close-action-btn { background: var(--slate-900); color: white; border: none; padding: 12px 28px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .close-action-btn:hover { background: black; }
        .tutor-profile-link { color: var(--primary-600); font-weight: 700; cursor: pointer; transition: 0.2s; }
        .tutor-profile-link:hover { text-decoration: underline; color: var(--primary-700); }
      `}</style>

      <div className="dashboard-container">
        {/* Main Content */}
        <div className="main-content">
          <div className="header">
            <div>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Welcome back,</p>
              <h2>Student 👋</h2>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
