using AutoMapper;
using Microsoft.AspNetCore.Http;
using StreamHub.Application.DTOs.User;
using StreamHub.Application.Interfaces;
using StreamHub.Domain.Entities;

namespace StreamHub.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public UserService(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<UserProfileDto?> GetUserByIdAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user == null ? null : _mapper.Map<UserProfileDto>(user);
    }

    public async Task<UploadProfilePictureResponseDto> UploadProfilePictureAsync(int userId, IFormFile file)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        // Generate unique filename
        var fileName = $"{userId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profile-images");

        // Ensure directory exists
        Directory.CreateDirectory(uploadsDir);

        var filePath = Path.Combine(uploadsDir, fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Remove old profile picture if exists
        if (!string.IsNullOrEmpty(user.ProfileImageUrl))
        {
            var oldFileName = Path.GetFileName(user.ProfileImageUrl);
            var oldFilePath = Path.Combine(uploadsDir, oldFileName);
            if (File.Exists(oldFilePath))
            {
                File.Delete(oldFilePath);
            }
        }

        // Update user
        var imageUrl = $"/uploads/profile-images/{fileName}";
        user.ProfileImageUrl = imageUrl;
        await _userRepository.UpdateAsync(user);

        return new UploadProfilePictureResponseDto { ProfileImageUrl = imageUrl };
    }

    public async Task RemoveProfilePictureAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        if (!string.IsNullOrEmpty(user.ProfileImageUrl))
        {
            var fileName = Path.GetFileName(user.ProfileImageUrl);
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profile-images", fileName);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }

        user.ProfileImageUrl = null;
        await _userRepository.UpdateAsync(user);
    }
}