using Microsoft.EntityFrameworkCore;
using StreamHub.Application.Interfaces;
using StreamHub.Domain.Entities;
using StreamHub.Infrastructure.Data;
using Stream = StreamHub.Domain.Entities.Stream;

namespace StreamHub.Infrastructure.Repositories;

public class StreamRepository : IStreamRepository
{
    private readonly ApplicationDbContext _context;

    public StreamRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Stream?> GetByIdAsync(int id)
    {
        return await _context.Streams
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Stream?> GetByStreamKeyAsync(string streamKey)
    {
        return await _context.Streams
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.StreamKey == streamKey);
    }

    public async Task<IEnumerable<Stream>> GetAllLiveStreamsAsync()
    {
        return await _context.Streams
            .Include(s => s.User)
            .Where(s => s.IsLive)
            .OrderByDescending(s => s.ViewerCount)
            .ToListAsync();
    }

    public async Task<IEnumerable<Stream>> GetUserStreamsAsync(int userId)
    {
        return await _context.Streams
            .Include(s => s.User)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<Stream> CreateAsync(Stream stream)
    {
        _context.Streams.Add(stream);
        await _context.SaveChangesAsync();

        // Load the User navigation property
        await _context.Entry(stream).Reference(s => s.User).LoadAsync();

        return stream;
    }

    public async Task UpdateAsync(Stream stream)
    {
        _context.Streams.Update(stream);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var stream = await _context.Streams.FindAsync(id);
        if (stream != null)
        {
            _context.Streams.Remove(stream);
            await _context.SaveChangesAsync();
        }
    }
}