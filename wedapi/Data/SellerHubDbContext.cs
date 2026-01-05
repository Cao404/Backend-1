using Microsoft.EntityFrameworkCore;
using SellerHub.Api.model;
using SellerHub.Api.Models;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace SellerHub.Api.Data;

public class SellerHubDbContext : DbContext
{
    public SellerHubDbContext(DbContextOptions<SellerHubDbContext> options)
         : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Models.SellerApplication> SellerApplications => Set<SellerApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // USERS
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.FullName).HasMaxLength(200).IsRequired();
            e.Property(x => x.Email).HasMaxLength(255).IsRequired();
            e.Property(x => x.Role).HasMaxLength(30).IsRequired();
            e.Property(x => x.Status).HasMaxLength(30).IsRequired();
        });

        // SELLER APPLICATIONS
        modelBuilder.Entity<SellerApplication>(e =>
        {
            e.HasIndex(x => x.UserId).IsUnique();
            e.Property(x => x.Status).HasMaxLength(30).IsRequired();

            e.HasOne(x => x.User)
             .WithOne(u => u.SellerApplication)
             .HasForeignKey<SellerApplication>(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
