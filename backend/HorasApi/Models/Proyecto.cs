using System.ComponentModel.DataAnnotations;

namespace HorasApi.Models;

public class Proyecto
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Codigo { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Descripcion { get; set; } = string.Empty;

    public int ClienteId { get; set; }
    public Cliente? Cliente { get; set; }

    public List<RegistroHoras> Registros { get; set; } = new();
}
