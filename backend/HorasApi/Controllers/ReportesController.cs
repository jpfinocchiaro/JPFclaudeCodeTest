using ClosedXML.Excel;
using HorasApi.Data;
using HorasApi.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HorasApi.Controllers;

[ApiController]
[Route("api/reportes")]
public class ReportesController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReportesController(AppDbContext db) => _db = db;

    [HttpGet("horas-por-proyecto")]
    public async Task<ActionResult<ReporteHorasResponseDto>> HorasPorProyecto(
        [FromQuery] DateOnly desde,
        [FromQuery] DateOnly hasta,
        [FromQuery] int? clienteId,
        [FromQuery] int? proyectoId)
    {
        if (hasta < desde) return BadRequest(new { message = "La fecha hasta no puede ser anterior a desde." });
        var data = await BuildReporte(desde, hasta, clienteId, proyectoId);
        return Ok(data);
    }

    [HttpGet("horas-por-proyecto/excel")]
    public async Task<IActionResult> HorasPorProyectoExcel(
        [FromQuery] DateOnly desde,
        [FromQuery] DateOnly hasta,
        [FromQuery] int? clienteId,
        [FromQuery] int? proyectoId)
    {
        if (hasta < desde) return BadRequest(new { message = "La fecha hasta no puede ser anterior a desde." });
        var data = await BuildReporte(desde, hasta, clienteId, proyectoId);

        using var wb = new XLWorkbook();
        var detalle = wb.Worksheets.Add("Detalle");
        detalle.Cell(1, 1).Value = "Reporte de horas por proyecto";
        detalle.Range(1, 1, 1, 7).Merge().Style.Font.SetBold().Font.FontSize = 14;
        detalle.Cell(2, 1).Value = $"Desde {desde:yyyy-MM-dd} — Hasta {hasta:yyyy-MM-dd}";
        detalle.Range(2, 1, 2, 7).Merge();

        var headers = new[] { "Código", "Proyecto", "Cliente", "Fecha", "Horas", "Descripción" };
        for (var i = 0; i < headers.Length; i++)
        {
            var c = detalle.Cell(4, i + 1);
            c.Value = headers[i];
            c.Style.Font.SetBold().Fill.BackgroundColor = XLColor.LightGray;
        }

        var row = 5;
        foreach (var it in data.Items)
        {
            detalle.Cell(row, 1).Value = it.ProyectoCodigo;
            detalle.Cell(row, 2).Value = it.ProyectoDescripcion;
            detalle.Cell(row, 3).Value = it.ClienteNombre;
            detalle.Cell(row, 4).Value = it.Fecha.ToDateTime(TimeOnly.MinValue);
            detalle.Cell(row, 4).Style.DateFormat.Format = "yyyy-MM-dd";
            detalle.Cell(row, 5).Value = it.Horas;
            detalle.Cell(row, 5).Style.NumberFormat.Format = "0.00";
            detalle.Cell(row, 6).Value = it.Descripcion ?? string.Empty;
            row++;
        }
        detalle.Cell(row, 4).Value = "Total";
        detalle.Cell(row, 4).Style.Font.SetBold();
        detalle.Cell(row, 5).Value = data.TotalHoras;
        detalle.Cell(row, 5).Style.Font.SetBold().NumberFormat.Format = "0.00";
        detalle.Columns().AdjustToContents();

        var resumen = wb.Worksheets.Add("Resumen");
        resumen.Cell(1, 1).Value = "Resumen por proyecto";
        resumen.Range(1, 1, 1, 5).Merge().Style.Font.SetBold().Font.FontSize = 14;

        var headersR = new[] { "Código", "Proyecto", "Cliente", "Registros", "Total horas" };
        for (var i = 0; i < headersR.Length; i++)
        {
            var c = resumen.Cell(3, i + 1);
            c.Value = headersR[i];
            c.Style.Font.SetBold().Fill.BackgroundColor = XLColor.LightGray;
        }
        var r = 4;
        foreach (var s in data.ResumenPorProyecto)
        {
            resumen.Cell(r, 1).Value = s.ProyectoCodigo;
            resumen.Cell(r, 2).Value = s.ProyectoDescripcion;
            resumen.Cell(r, 3).Value = s.ClienteNombre;
            resumen.Cell(r, 4).Value = s.CantidadRegistros;
            resumen.Cell(r, 5).Value = s.TotalHoras;
            resumen.Cell(r, 5).Style.NumberFormat.Format = "0.00";
            r++;
        }
        resumen.Cell(r, 4).Value = "Total";
        resumen.Cell(r, 4).Style.Font.SetBold();
        resumen.Cell(r, 5).Value = data.TotalHoras;
        resumen.Cell(r, 5).Style.Font.SetBold().NumberFormat.Format = "0.00";
        resumen.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        var fileName = $"horas-por-proyecto_{desde:yyyyMMdd}_{hasta:yyyyMMdd}.xlsx";
        return File(ms.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName);
    }

    [HttpGet("horas-por-proyecto/pdf")]
    public async Task<IActionResult> HorasPorProyectoPdf(
        [FromQuery] DateOnly desde,
        [FromQuery] DateOnly hasta,
        [FromQuery] int? clienteId,
        [FromQuery] int? proyectoId)
    {
        if (hasta < desde) return BadRequest(new { message = "La fecha hasta no puede ser anterior a desde." });
        var data = await BuildReporte(desde, hasta, clienteId, proyectoId);

        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(30);
                page.DefaultTextStyle(t => t.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Text("Reporte de horas por proyecto").FontSize(16).Bold();
                    col.Item().Text($"Período: {desde:yyyy-MM-dd} a {hasta:yyyy-MM-dd}");
                });

                page.Content().PaddingVertical(10).Column(col =>
                {
                    col.Item().PaddingBottom(4).Text("Resumen por proyecto").FontSize(12).Bold();
                    col.Item().Table(t =>
                    {
                        t.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(80);
                            c.RelativeColumn(3);
                            c.RelativeColumn(2);
                            c.ConstantColumn(70);
                            c.ConstantColumn(80);
                        });
                        t.Header(h =>
                        {
                            h.Cell().Element(HeaderCell).Text("Código");
                            h.Cell().Element(HeaderCell).Text("Proyecto");
                            h.Cell().Element(HeaderCell).Text("Cliente");
                            h.Cell().Element(HeaderCell).AlignRight().Text("Registros");
                            h.Cell().Element(HeaderCell).AlignRight().Text("Horas");
                        });
                        foreach (var s in data.ResumenPorProyecto)
                        {
                            t.Cell().Element(BodyCell).Text(s.ProyectoCodigo);
                            t.Cell().Element(BodyCell).Text(s.ProyectoDescripcion);
                            t.Cell().Element(BodyCell).Text(s.ClienteNombre);
                            t.Cell().Element(BodyCell).AlignRight().Text(s.CantidadRegistros.ToString());
                            t.Cell().Element(BodyCell).AlignRight().Text(s.TotalHoras.ToString("0.00"));
                        }
                        t.Cell().ColumnSpan(3).Element(TotalCell).AlignRight().Text("Total").Bold();
                        t.Cell().Element(TotalCell).AlignRight().Text(data.ResumenPorProyecto.Sum(x => x.CantidadRegistros).ToString()).Bold();
                        t.Cell().Element(TotalCell).AlignRight().Text(data.TotalHoras.ToString("0.00")).Bold();
                    });

                    col.Item().PaddingTop(16).PaddingBottom(4).Text("Detalle de registros").FontSize(12).Bold();
                    col.Item().Table(t =>
                    {
                        t.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(70);
                            c.RelativeColumn(2);
                            c.RelativeColumn(2);
                            c.ConstantColumn(70);
                            c.ConstantColumn(55);
                            c.RelativeColumn(3);
                        });
                        t.Header(h =>
                        {
                            h.Cell().Element(HeaderCell).Text("Código");
                            h.Cell().Element(HeaderCell).Text("Proyecto");
                            h.Cell().Element(HeaderCell).Text("Cliente");
                            h.Cell().Element(HeaderCell).Text("Fecha");
                            h.Cell().Element(HeaderCell).AlignRight().Text("Horas");
                            h.Cell().Element(HeaderCell).Text("Descripción");
                        });
                        foreach (var it in data.Items)
                        {
                            t.Cell().Element(BodyCell).Text(it.ProyectoCodigo);
                            t.Cell().Element(BodyCell).Text(it.ProyectoDescripcion);
                            t.Cell().Element(BodyCell).Text(it.ClienteNombre);
                            t.Cell().Element(BodyCell).Text(it.Fecha.ToString("yyyy-MM-dd"));
                            t.Cell().Element(BodyCell).AlignRight().Text(it.Horas.ToString("0.00"));
                            t.Cell().Element(BodyCell).Text(it.Descripcion ?? string.Empty);
                        }
                    });
                });

                page.Footer().AlignRight().Text(x =>
                {
                    x.Span("Página ");
                    x.CurrentPageNumber();
                    x.Span(" / ");
                    x.TotalPages();
                });
            });
        });

        var bytes = pdf.GeneratePdf();
        var fileName = $"horas-por-proyecto_{desde:yyyyMMdd}_{hasta:yyyyMMdd}.pdf";
        return File(bytes, "application/pdf", fileName);

        static IContainer HeaderCell(IContainer c) =>
            c.Background(Colors.Grey.Lighten2).Padding(4).DefaultTextStyle(t => t.Bold());
        static IContainer BodyCell(IContainer c) =>
            c.BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(4);
        static IContainer TotalCell(IContainer c) =>
            c.Background(Colors.Grey.Lighten3).Padding(4);
    }

    private async Task<ReporteHorasResponseDto> BuildReporte(DateOnly desde, DateOnly hasta, int? clienteId, int? proyectoId)
    {
        var q = _db.Registros
            .Include(r => r.Proyecto).ThenInclude(p => p!.Cliente)
            .Where(r => r.Fecha >= desde && r.Fecha <= hasta);

        if (proyectoId.HasValue)
            q = q.Where(r => r.ProyectoId == proyectoId.Value);
        else if (clienteId.HasValue)
            q = q.Where(r => r.Proyecto!.ClienteId == clienteId.Value);

        var items = await q
            .OrderBy(r => r.Proyecto!.Codigo).ThenBy(r => r.Fecha).ThenBy(r => r.Id)
            .Select(r => new ReporteHorasItemDto(
                r.Id,
                r.ProyectoId,
                r.Proyecto!.Codigo,
                r.Proyecto!.Descripcion,
                r.Proyecto!.ClienteId,
                r.Proyecto!.Cliente!.Nombre,
                r.Fecha,
                r.Horas,
                r.Descripcion))
            .ToListAsync();

        var resumen = items
            .GroupBy(i => new { i.ProyectoId, i.ProyectoCodigo, i.ProyectoDescripcion, i.ClienteNombre })
            .Select(g => new ReporteHorasProyectoResumenDto(
                g.Key.ProyectoId,
                g.Key.ProyectoCodigo,
                g.Key.ProyectoDescripcion,
                g.Key.ClienteNombre,
                g.Count(),
                g.Sum(x => x.Horas)))
            .OrderBy(x => x.ProyectoCodigo)
            .ToList();

        return new ReporteHorasResponseDto(
            desde, hasta, clienteId, proyectoId,
            items, resumen, items.Sum(i => i.Horas));
    }
}
