using Microsoft.AspNetCore.Mvc;
using SellerHub.Api.Data;
using SellerHub.Api.Dtos;

namespace SellerHub.Api.Controllers;

[ApiController]
[Route("api/khach-hang")]
public class KhachHangController : ControllerBase
{
    private readonly KhachHangRepository _repo;
    public KhachHangController(KhachHangRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? tuKhoa, [FromQuery] string? loai, [FromQuery] bool? trangThai)
        => Ok(await _repo.GetAllAsync(tuKhoa, loai, trangThai));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _repo.GetByIdAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] KhachHangCreateReq req)
    {
        if (string.IsNullOrWhiteSpace(req.HoTen)) return BadRequest("HoTen is required");
        if (string.IsNullOrWhiteSpace(req.SoDienThoai)) return BadRequest("SoDienThoai is required");

        var id = await _repo.CreateAsync(req);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] KhachHangUpdateReq req)
    {
        if (string.IsNullOrWhiteSpace(req.HoTen)) return BadRequest("HoTen is required");
        if (string.IsNullOrWhiteSpace(req.SoDienThoai)) return BadRequest("SoDienThoai is required");

        var ok = await _repo.UpdateAsync(id, req);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _repo.DeleteAsync(id);
        return ok == 0 ? NotFound() : NoContent();
    }
}
