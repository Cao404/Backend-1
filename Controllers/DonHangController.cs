using Microsoft.AspNetCore.Mvc;
using SellerHub.Api.Data;
using SellerHub.Api.Dtos;

namespace SellerHub.Api.Controllers;

[ApiController]
[Route("api/don-hang")]
public class DonHangController : ControllerBase
{
    private readonly DonHangRepository _repo;
    public DonHangController(DonHangRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<ActionResult<List<DonHangListDto>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? q,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var data = await _repo.GetAllAsync(status, q, from, to);
        return Ok(data);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DonHangDetailDto>> GetById(int id)
    {
        var dto = await _repo.GetByIdAsync(id);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] DonHangCreateReq req)
    {
        var id = await _repo.CreateAsync(req);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPatch("{id:int}/trang-thai")]
    public async Task<ActionResult> UpdateTrangThai(int id, [FromBody] UpdateTrangThaiReq req)
    {
        if (string.IsNullOrWhiteSpace(req.Status)) return BadRequest("Status is required");
        var ok = await _repo.UpdateTrangThaiAsync(id, req.Status.Trim());
        if (!ok) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> SoftDelete(int id)
    {
        var ok = await _repo.SoftDeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}
