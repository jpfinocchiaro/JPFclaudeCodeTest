using System.ComponentModel.DataAnnotations;

namespace HorasApi.Models;

public class RegistroHoras
{
    public int Id { get; set; }

    public int ProyectoId { get; set; }
    public Proyecto? Proyecto { get; set; }

    [Required]
    public DateOnly Fecha { get; set; }

    [Range(0.01, 24)]
    public decimal Horas { get; set; }

    [MaxLength(1000)]
    public string? Descripcion { get; set; }
}
