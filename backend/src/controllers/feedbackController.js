import Feedback from '../models/Feedback.js';

export const createFeedback = async (req, res) => {
  try {
    const { rating, comment, userId, userEmail, userName } = req.body;

    const feedback = new Feedback({
      rating,
      comment,
      userId,
      userEmail,
      userName,
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Feedback creation error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

export const getFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments();
    const hasMore = total > skip + limit;

    res.json({
      feedback,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
      total,
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
};