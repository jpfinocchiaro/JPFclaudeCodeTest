using HorasApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HorasApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Proyecto> Proyectos => Set<Proyecto>();
    public DbSet<RegistroHoras> Registros => Set<RegistroHoras>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Proyecto>()
            .HasIndex(p => p.Codigo)
            .IsUnique();

        modelBuilder.Entity<Proyecto>()
            .HasOne(p => p.Cliente)
            .WithMany(c => c.Proyectos)
            .HasForeignKey(p => p.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RegistroHoras>()
            .HasOne(r => r.Proyecto)
            .WithMany(p => p.Registros)
            .HasForeignKey(r => r.ProyectoId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RegistroHoras>()
            .Property(r => r.Horas)
            .HasPrecision(5, 2);
    }
}
