using System.ComponentModel.DataAnnotations;

namespace HorasApi.Dtos;

public record RegistroHorasDto(int Id, int ProyectoId, DateOnly Fecha, decimal Horas, string? Descripcion);

public class RegistroHorasInputDto
{
    [Required]
    public int ProyectoId { get; set; }

    [Required]
    public DateOnly Fecha { get; set; }

    [Range(0.01, 24)]
    public decimal Horas { get; set; }

    [MaxLength(1000)]
    public string? Descripcion { get; set; }
}
