using Microsoft.EntityFrameworkCore;
using StreamHub.Application.Interfaces;
using StreamHub.Domain.Entities;
using StreamHub.Infrastructure.Data;

namespace StreamHub.Infrastructure.Repositories;

public class ChatRepository : IChatRepository
{
    private readonly ApplicationDbContext _context;

    public ChatRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ChatMessage> CreateAsync(ChatMessage message)
    {
        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();

        // Load navigation properties
        await _context.Entry(message).Reference(m => m.User).LoadAsync();
        await _context.Entry(message).Reference(m => m.Stream).LoadAsync();

        return message;
    }

    public async Task<IEnumerable<ChatMessage>> GetStreamMessagesAsync(int streamId, int limit = 50)
    {
        return await _context.ChatMessages
            .Include(m => m.User)
            .Where(m => m.StreamId == streamId)
            .OrderByDescending(m => m.SentAt)
            .Take(limit)
            .OrderBy(m => m.SentAt)
            .ToListAsync();
    }
}