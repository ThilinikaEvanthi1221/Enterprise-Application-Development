const Notification = require('../models/notification');
const User = require('../models/user');
const { io } = require('../config/socketio');

const createSystemRiskNotification = async (riskType, details) => {
    try {
        // Find all admin users
        const admins = await User.find({ role: 'admin' });
        
        let title, message;
        switch(riskType) {
            case 'FAILED_LOGIN':
                title = 'Multiple Failed Login Attempts';
                message = `Multiple failed login attempts detected from IP: ${details.ip}`;
                break;
            case 'UNUSUAL_ACTIVITY':
                title = 'Unusual System Activity Detected';
                message = `${details.message}`;
                break;
            case 'SYSTEM_RISK':
                title = 'System Risk Alert';
                message = `${details.message}`;
                break;
            default:
                title = 'System Alert';
                message = details.message;
        }

        // Create notifications for all admins
        for (const admin of admins) {
            const notification = await Notification.create({
                userId: admin._id,
                type: riskType,
                title: title,
                message: message,
                read: false,
                severity: details.severity || 'high',
                metadata: {
                    ...details,
                    timestamp: new Date(),
                }
            });

            // Emit real-time notification to admin
            io.to(admin._id.toString()).emit('systemNotification', notification);
        }
    } catch (error) {
        console.error('Error creating system risk notification:', error);
    }
};

// Monitor failed login attempts
const loginAttempts = new Map(); // Store IP -> attempts count

const monitorLoginAttempts = (ip) => {
    const attempts = loginAttempts.get(ip) || 0;
    loginAttempts.set(ip, attempts + 1);

    // If more than 5 failed attempts in a short time
    if (attempts + 1 >= 5) {
        createSystemRiskNotification('FAILED_LOGIN', {
            ip,
            attempts: attempts + 1,
            severity: 'high'
        });
        // Reset attempts after notification
        loginAttempts.delete(ip);
    }

    // Clear attempts after 15 minutes
    setTimeout(() => loginAttempts.delete(ip), 15 * 60 * 1000);
};

module.exports = {
    createSystemRiskNotification,
    monitorLoginAttempts
};
