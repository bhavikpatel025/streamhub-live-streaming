using Microsoft.EntityFrameworkCore;
using StreamHub.Application.Interfaces;
using StreamHub.Domain.Entities;
using StreamHub.Infrastructure.Data;

namespace StreamHub.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly ApplicationDbContext _context;

    public NotificationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<Notification>> CreateStreamStartedNotificationsAsync(
        int streamerUserId,
        int streamId,
        string streamerName,
        string streamTitle,
        DateTime createdAt)
    {
        var recipientIds = await _context.Users
            .AsNoTracking()
            .Where(user => user.Id != streamerUserId)
            .Select(user => user.Id)
            .ToListAsync();

        if (recipientIds.Count == 0)
        {
            return Array.Empty<Notification>();
        }

        var message = $"{streamerName} is live now: {streamTitle}";
        var notifications = recipientIds
            .Select(userId => new Notification
            {
                UserId = userId,
                StreamId = streamId,
                StreamerName = streamerName,
                StreamTitle = streamTitle,
                Message = message,
                IsRead = false,
                CreatedAt = createdAt
            })
            .ToList();

        _context.Notifications.AddRange(notifications);
        await _context.SaveChangesAsync();

        return notifications;
    }

    public async Task<IReadOnlyCollection<Notification>> GetByUserIdAsync(int userId)
    {
        return await _context.Notifications
            .AsNoTracking()
            .Where(notification => notification.UserId == userId)
            .OrderByDescending(notification => notification.CreatedAt)
            .ToListAsync();
    }

    public Task<Notification?> GetByIdAsync(int id, int userId)
    {
        return _context.Notifications.FirstOrDefaultAsync(
            notification => notification.Id == id && notification.UserId == userId);
    }

    public async Task DeleteAsync(Notification notification)
    {
        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAllByUserIdAsync(int userId)
    {
        var notifications = await _context.Notifications
            .Where(notification => notification.UserId == userId)
            .ToListAsync();

        if (notifications.Count == 0)
        {
            return;
        }

        _context.Notifications.RemoveRange(notifications);
        await _context.SaveChangesAsync();
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var notifications = await _context.Notifications
            .Where(notification => notification.UserId == userId && !notification.IsRead)
            .ToListAsync();

        if (notifications.Count == 0)
        {
            return;
        }

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();
    }
}
