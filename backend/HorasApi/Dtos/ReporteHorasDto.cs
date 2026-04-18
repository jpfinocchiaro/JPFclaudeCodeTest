namespace HorasApi.Dtos;

public record ReporteHorasItemDto(
    int RegistroId,
    int ProyectoId,
    string ProyectoCodigo,
    string ProyectoDescripcion,
    int ClienteId,
    string ClienteNombre,
    DateOnly Fecha,
    decimal Horas,
    string? Descripcion);

public record ReporteHorasProyectoResumenDto(
    int ProyectoId,
    string ProyectoCodigo,
    string ProyectoDescripcion,
    string ClienteNombre,
    int CantidadRegistros,
    decimal TotalHoras);

public record ReporteHorasResponseDto(
    DateOnly Desde,
    DateOnly Hasta,
    int? ClienteId,
    int? ProyectoId,
    IReadOnlyList<ReporteHorasItemDto> Items,
    IReadOnlyList<ReporteHorasProyectoResumenDto> ResumenPorProyecto,
    decimal TotalHoras);
