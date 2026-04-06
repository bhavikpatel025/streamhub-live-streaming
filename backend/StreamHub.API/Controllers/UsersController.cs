using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StreamHub.Application.DTOs.User;
using StreamHub.Application.Interfaces;
using System.Security.Claims;

namespace StreamHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetMyProfile()
    {
        var userId = GetUserId();
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }
        return Ok(user);
    }

    [HttpPost("profile-picture")]
    public async Task<ActionResult<UploadProfilePictureResponseDto>> UploadProfilePicture(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
        var fileExtension = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(fileExtension))
        {
            return BadRequest(new { message = "Invalid file type. Only JPG, JPEG, and PNG are allowed." });
        }

        // Validate file size (2MB)
        if (file.Length > 2 * 1024 * 1024)
        {
            return BadRequest(new { message = "File size exceeds 2MB limit." });
        }

        var userId = GetUserId();
        try
        {
            var result = await _userService.UploadProfilePictureAsync(userId, file);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("profile-picture")]
    public async Task<IActionResult> RemoveProfilePicture()
    {
        var userId = GetUserId();
        try
        {
            await _userService.RemoveProfilePictureAsync(userId);
            return Ok(new { message = "Profile picture removed successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
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