using Microsoft.EntityFrameworkCore;
using StreamHub.Domain.Entities;
using Stream = StreamHub.Domain.Entities.Stream;

namespace StreamHub.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Stream> Streams { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<StreamReaction> StreamReactions { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
        });

        // Stream configuration
        modelBuilder.Entity<Stream>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.StreamKey).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.StreamKey).IsUnique();

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Streams)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ChatMessage configuration
        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(500);

            entity.HasOne(e => e.Stream)
                  .WithMany(s => s.ChatMessages)
                  .HasForeignKey(e => e.StreamId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.ChatMessages)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.NoAction);
        });

        // StreamReaction configuration
        modelBuilder.Entity<StreamReaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.StreamId, e.UserId }).IsUnique();
            entity.Property(e => e.ReactionType).IsRequired().HasMaxLength(15);

            entity.HasOne(e => e.Stream)
                  .WithMany()
                  .HasForeignKey(e => e.StreamId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StreamerName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.StreamTitle).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(300);
            entity.Property(e => e.IsRead).HasDefaultValue(false);

            entity.HasIndex(e => new { e.UserId, e.CreatedAt });

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Stream)
                  .WithMany()
                  .HasForeignKey(e => e.StreamId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
