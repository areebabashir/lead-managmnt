import Contact from '../models/contactModel.js';
import Task from '../models/taskModel.js';
import Campaign from '../models/campaignModel.js';
import User from '../models/authModel.js';
import { hasPermission } from '../helpers/permissionHelper.js';

// Get dashboard overview data
export const getDashboardOverview = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'dashboards', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot access dashboard'
            });
        }

        const userId = req.user._id;
        const isAdmin = req.user.isSuperAdmin || req.user.role?.level >= 4;

        // Get counts for different entities
        const contactCounts = await getContactCounts(userId, isAdmin);
        const taskCounts = await getTaskCounts(userId, isAdmin);
        const campaignCounts = await getCampaignCounts(userId, isAdmin);
        const userCounts = await getUserCounts(isAdmin);

        // Get recent activities
        const recentActivities = await getRecentActivities(userId, isAdmin);

        // Get performance metrics
        const performanceMetrics = await getPerformanceMetrics(userId, isAdmin);

        res.json({
            success: true,
            data: {
                overview: {
                    contacts: contactCounts,
                    tasks: taskCounts,
                    campaigns: campaignCounts,
                    users: userCounts
                },
                recentActivities,
                performanceMetrics
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard overview:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard overview',
            error: error.message
        });
    }
};

// Get pipeline health dashboard
export const getPipelineHealth = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'dashboards', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot access dashboard'
            });
        }

        const userId = req.user._id;
        const isAdmin = req.user.isSuperAdmin || req.user.role?.level >= 4;

        // Get pipeline data
        const pipelineData = await getPipelineData(userId, isAdmin);
        const conversionRates = await getConversionRates(userId, isAdmin);
        const leadSourceEffectiveness = await getLeadSourceEffectiveness(userId, isAdmin);

        res.json({
            success: true,
            data: {
                pipeline: pipelineData,
                conversionRates,
                leadSourceEffectiveness
            }
        });
    } catch (error) {
        console.error('Error fetching pipeline health:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pipeline health',
            error: error.message
        });
    }
};

// Get sales performance metrics
export const getSalesPerformance = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'reports', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot access reports'
            });
        }

        const { period = 'month', userId: targetUserId } = req.query;
        const currentUserId = req.user._id;
        const isAdmin = req.user.isSuperAdmin || req.user.role?.level >= 4;

        // Determine which user's data to fetch
        const userId = isAdmin && targetUserId ? targetUserId : currentUserId;

        const salesMetrics = await getSalesMetrics(userId, period);
        const performanceTrends = await getPerformanceTrends(userId, period);
        const topPerformers = await getTopPerformers(period);

        res.json({
            success: true,
            data: {
                salesMetrics,
                performanceTrends,
                topPerformers
            }
        });
    } catch (error) {
        console.error('Error fetching sales performance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sales performance',
            error: error.message
        });
    }
};

// Get campaign performance metrics
export const getCampaignPerformance = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'reports', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot access reports'
            });
        }

        const userId = req.user._id;
        const isAdmin = req.user.isSuperAdmin || req.user.role?.level >= 4;

        const campaignMetrics = await getCampaignMetrics(userId, isAdmin);
        const emailPerformance = await getEmailPerformance(userId, isAdmin);
        const roiMetrics = await getROIMetrics(userId, isAdmin);

        res.json({
            success: true,
            data: {
                campaignMetrics,
                emailPerformance,
                roiMetrics
            }
        });
    } catch (error) {
        console.error('Error fetching campaign performance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching campaign performance',
            error: error.message
        });
    }
};

// Helper function to get contact counts
const getContactCounts = async (userId, isAdmin) => {
    const filter = isAdmin ? { isActive: true } : { assignedTo: userId, isActive: true };

    const total = await Contact.countDocuments(filter);
    const newLeads = await Contact.countDocuments({ ...filter, status: 'prospect' });
    const qualified = await Contact.countDocuments({ ...filter, status: 'qualified' });
    const proposal = await Contact.countDocuments({ ...filter, status: 'proposal' });
    const negotiation = await Contact.countDocuments({ ...filter, status: 'negotiation' });
    const won = await Contact.countDocuments({ ...filter, status: 'closed_won' });
    const lost = await Contact.countDocuments({ ...filter, status: 'closed_lost' });

    return {
        total,
        newLeads,
        qualified,
        proposal,
        negotiation,
        won,
        lost
    };
};

// Helper function to get task counts
const getTaskCounts = async (userId, isAdmin) => {
    const filter = isAdmin ? { isActive: true } : { assignedTo: userId, isActive: true };

    const total = await Task.countDocuments(filter);
    const todo = await Task.countDocuments({ ...filter, status: 'todo' });
    const inProgress = await Task.countDocuments({ ...filter, status: 'in_progress' });
    const review = await Task.countDocuments({ ...filter, status: 'review' });
    const done = await Task.countDocuments({ ...filter, status: 'done' });
    const overdue = await Task.countDocuments({
        ...filter,
        dueDate: { $lt: new Date() },
        status: { $nin: ['done', 'cancelled'] }
    });

    return {
        total,
        todo,
        inProgress,
        review,
        done,
        overdue
    };
};

// Helper function to get campaign counts
const getCampaignCounts = async (userId, isAdmin) => {
    const filter = isAdmin ? { isActive: true } : { 
        $or: [{ assignedTo: userId }, { 'team.user': userId }],
        isActive: true 
    };

    const total = await Campaign.countDocuments(filter);
    const draft = await Campaign.countDocuments({ ...filter, status: 'draft' });
    const scheduled = await Campaign.countDocuments({ ...filter, status: 'scheduled' });
    const active = await Campaign.countDocuments({ ...filter, status: 'active' });
    const completed = await Campaign.countDocuments({ ...filter, status: 'completed' });

    return {
        total,
        draft,
        scheduled,
        active,
        completed
    };
};

// Helper function to get user counts
const getUserCounts = async (isAdmin) => {
    if (!isAdmin) return { total: 0, active: 0, inactive: 0 };

    const total = await User.countDocuments();
    const active = await User.countDocuments({ isActive: true });
    const inactive = await User.countDocuments({ isActive: false });

    return {
        total,
        active,
        inactive
    };
};

// Helper function to get recent activities
const getRecentActivities = async (userId, isAdmin) => {
    const filter = isAdmin ? {} : { createdBy: userId };
    const limit = 10;

    // Get recent contacts
    const recentContacts = await Contact.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('firstName lastName company status createdAt')
        .populate('createdBy', 'name');

    // Get recent tasks
    const recentTasks = await Task.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title status createdAt')
        .populate('createdBy', 'name');

    // Get recent campaigns
    const recentCampaigns = await Campaign.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('name status createdAt')
        .populate('createdBy', 'name');

    // Combine and sort by date
    const allActivities = [
        ...recentContacts.map(c => ({ ...c.toObject(), type: 'contact' })),
        ...recentTasks.map(t => ({ ...t.toObject(), type: 'task' })),
        ...recentCampaigns.map(c => ({ ...c.toObject(), type: 'campaign' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return allActivities.slice(0, limit);
};

// Helper function to get performance metrics
const getPerformanceMetrics = async (userId, isAdmin) => {
    const filter = isAdmin ? { isActive: true } : { assignedTo: userId, isActive: true };

    // Calculate conversion rates
    const totalContacts = await Contact.countDocuments(filter);
    const wonContacts = await Contact.countDocuments({ ...filter, status: 'closed_won' });
    const conversionRate = totalContacts > 0 ? (wonContacts / totalContacts) * 100 : 0;

    // Calculate average response time (simplified)
    const contactsWithNotes = await Contact.find({ ...filter, 'notes.0': { $exists: true } });
    const avgResponseTime = contactsWithNotes.length > 0 ? 
        contactsWithNotes.reduce((sum, contact) => {
            const firstNote = contact.notes[0];
            const responseTime = new Date(firstNote.createdAt) - new Date(contact.createdAt);
            return sum + responseTime;
        }, 0) / contactsWithNotes.length : 0;

    // Calculate task completion rate
    const totalTasks = await Task.countDocuments(filter);
    const completedTasks = await Task.countDocuments({ ...filter, status: 'done' });
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime / (1000 * 60 * 60 * 24) * 100) / 100, // in days
        taskCompletionRate: Math.round(taskCompletionRate * 100) / 100
    };
};

// Helper function to get pipeline data
const getPipelineData = async (userId, isAdmin) => {
    const filter = isAdmin ? { isActive: true } : { assignedTo: userId, isActive: true };

    const stages = ['prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    const pipelineData = {};

    for (const stage of stages) {
        const count = await Contact.countDocuments({ ...filter, status: stage });
        const value = await Contact.aggregate([
            { $match: { ...filter, status: stage } },
            { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
        ]);

        pipelineData[stage] = {
            count,
            value: value[0]?.total || 0
        };
    }

    return pipelineData;
};

// Helper function to get conversion rates
const getConversionRates = async (userId, isAdmin) => {
    const filter = isAdmin ? { isActive: true } : { assignedTo: userId, isActive: true };

    const total = await Contact.countDocuments(filter);
    const qualified = await Contact.countDocuments({ ...filter, status: 'qualified' });
    const proposal = await Contact.countDocuments({ ...filter, status: 'proposal' });
    const negotiation = await Contact.countDocuments({ ...filter, status: 'negotiation' });
    const won = await Contact.countDocuments({ ...filter, status: 'closed_won' });

    return {
        prospectToQualified: total > 0 ? (qualified / total) * 100 : 0,
        qualifiedToProposal: qualified > 0 ? (proposal / qualified) * 100 : 0,
        proposalToNegotiation: proposal > 0 ? (negotiation / proposal) * 100 : 0,
        negotiationToWon: negotiation > 0 ? (won / negotiation) * 100 : 0,
        overallConversion: total > 0 ? (won / total) * 100 : 0
    };
};

// Helper function to get lead source effectiveness
const getLeadSourceEffectiveness = async (userId, isAdmin) => {
    const filter = isAdmin ? { isActive: true } : { assignedTo: userId, isActive: true };

    const sources = await Contact.aggregate([
        { $match: filter },
        { $group: { _id: '$source', count: { $sum: 1 }, won: { $sum: { $cond: [{ $eq: ['$status', 'closed_won'] }, 1, 0] } } } },
        { $project: { source: '$_id', count: 1, won: 1, conversionRate: { $multiply: [{ $divide: ['$won', '$count'] }, 100] } } },
        { $sort: { count: -1 } }
    ]);

    return sources;
};

// Helper function to get sales metrics
const getSalesMetrics = async (userId, period) => {
    const filter = { assignedTo: userId, isActive: true };
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const contactsInPeriod = await Contact.find({
        ...filter,
        createdAt: { $gte: startDate }
    });

    const totalValue = contactsInPeriod.reduce((sum, contact) => sum + (contact.estimatedValue || 0), 0);
    const wonValue = contactsInPeriod
        .filter(contact => contact.status === 'closed_won')
        .reduce((sum, contact) => sum + (contact.estimatedValue || 0), 0);

    return {
        totalContacts: contactsInPeriod.length,
        totalValue,
        wonValue,
        winRate: contactsInPeriod.length > 0 ? 
            (contactsInPeriod.filter(c => c.status === 'closed_won').length / contactsInPeriod.length) * 100 : 0
    };
};

// Helper function to get performance trends
const getPerformanceTrends = async (userId, period) => {
    // This would typically involve more complex date aggregation
    // For now, returning simplified data
    return {
        trend: 'increasing',
        growthRate: 15.5,
        period: period
    };
};

// Helper function to get top performers
const getTopPerformers = async (period) => {
    const users = await User.find({ isActive: true }).select('name email');
    const performers = [];

    for (const user of users) {
        const wonContacts = await Contact.countDocuments({
            assignedTo: user._id,
            status: 'closed_won',
            isActive: true
        });

        const totalValue = await Contact.aggregate([
            { $match: { assignedTo: user._id, status: 'closed_won', isActive: true } },
            { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
        ]);

        performers.push({
            user: { name: user.name, email: user.email },
            wonContacts,
            totalValue: totalValue[0]?.total || 0
        });
    }

    return performers.sort((a, b) => b.totalValue - a.totalValue).slice(0, 5);
};

// Helper function to get campaign metrics
const getCampaignMetrics = async (userId, isAdmin) => {
    const filter = isAdmin ? { isActive: true } : { 
        $or: [{ assignedTo: userId }, { 'team.user': userId }],
        isActive: true 
    };

    const campaigns = await Campaign.find(filter);
    
    const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.metrics.sent, 0);
    const totalOpened = campaigns.reduce((sum, campaign) => sum + campaign.metrics.opened, 0);
    const totalClicked = campaigns.reduce((sum, campaign) => sum + campaign.metrics.clicked, 0);
    const totalReplied = campaigns.reduce((sum, campaign) => sum + campaign.metrics.replied, 0);

    return {
        totalCampaigns: campaigns.length,
        totalSent,
        totalOpened,
        totalClicked,
        totalReplied,
        avgOpenRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        avgClickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
        avgReplyRate: totalSent > 0 ? (totalReplied / totalSent) * 100 : 0
    };
};

// Helper function to get email performance
const getEmailPerformance = async (userId, isAdmin) => {
    const filter = isAdmin ? { isActive: true } : { 
        $or: [{ assignedTo: userId }, { 'team.user': userId }],
        isActive: true 
    };

    const emailCampaigns = await Campaign.find({ ...filter, type: 'email' });
    
    return emailCampaigns.map(campaign => ({
        name: campaign.name,
        sent: campaign.metrics.sent,
        delivered: campaign.metrics.delivered,
        opened: campaign.metrics.opened,
        clicked: campaign.metrics.clicked,
        openRate: campaign.openRate,
        clickRate: campaign.clickRate
    }));
};

// Helper function to get ROI metrics
const getROIMetrics = async (userId, isAdmin) => {
    const filter = isAdmin ? { isActive: true } : { 
        $or: [{ assignedTo: userId }, { 'team.user': userId }],
        isActive: true 
    };

    const campaigns = await Campaign.find(filter);
    
    const totalCost = campaigns.reduce((sum, campaign) => sum + (campaign.budget.spent || 0), 0);
    const totalRevenue = campaigns.reduce((sum, campaign) => sum + (campaign.roi.revenue || 0), 0);
    const totalROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

    return {
        totalCost,
        totalRevenue,
        totalROI,
        campaigns: campaigns.map(campaign => ({
            name: campaign.name,
            cost: campaign.budget.spent || 0,
            revenue: campaign.roi.revenue || 0,
            roi: campaign.roiPercentage
        }))
    };
};
