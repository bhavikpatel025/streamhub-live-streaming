using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StreamHub.Application.DTOs.Notification;
using StreamHub.Application.Interfaces;
using System.Security.Claims;

namespace StreamHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<NotificationDto>>> GetNotifications()
    {
        var notifications = await _notificationService.GetUserNotificationsAsync(GetUserId());
        return Ok(notifications);
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _notificationService.MarkAllAsReadAsync(GetUserId());
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var deleted = await _notificationService.DeleteNotificationAsync(GetUserId(), id);
        return deleted ? NoContent() : NotFound(new { message = "Notification not found" });
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteAllNotifications()
    {
        await _notificationService.DeleteAllNotificationsAsync(GetUserId());
        return NoContent();
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            throw new UnauthorizedAccessException("User not authenticated");
        }

        return int.Parse(userIdClaim.Value);
    }
}
