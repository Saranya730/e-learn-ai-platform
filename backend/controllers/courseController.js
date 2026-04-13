const Course = require('../models/Course');

// @desc Get all courses
// @route GET /api/courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Create a course (Admin only)
// @route POST /api/courses
const createCourse = async (req, res) => {
    try {
        const { title, description, duration, price, skills, instructor } = req.body;
        const newCourse = new Course({
            title,
            description,
            duration,
            price,
            skills,
            instructor
        });
        await newCourse.save();
        res.status(201).json({ message: 'Course created successfully', course: newCourse });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Update a course (Admin only)
// @route PUT /api/courses/:id
const updateCourse = async (req, res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Delete a course (Admin only)
// @route DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse };
