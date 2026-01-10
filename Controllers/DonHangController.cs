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

    // GET /api/don-hang
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? trangThai,
        [FromQuery] string? q,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
        => Ok(await _repo.GetAllAsync(trangThai, q, from, to));

    // GET /api/don-hang/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var dto = await _repo.GetByIdAsync(id);
        return dto == null ? NotFound() : Ok(dto);
    }

    // POST /api/don-hang/create
    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] DonHangCreateReq req)
    {
        var id = await _repo.CreateAsync(req);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    // PUT /api/don-hang/update/{id}
    [HttpPut("update/{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] DonHangUpdateReq req)
    {
        var ok = await _repo.UpdateAsync(id, req);
        if (!ok) return NotFound();
        return NoContent();
    }

    // ===== CẬP NHẬT TRẠNG THÁI (TIẾNG VIỆT) =====

    // PUT /api/don-hang/cho-xac-nhan/{id}
    [HttpPut("cho-xac-nhan/{id:int}")]
    public async Task<IActionResult> ChoXacNhan(int id)
        => await SetTrangThai(id, "pending");

    // PUT /api/don-hang/dang-xu-ly/{id}
    [HttpPut("dang-xu-ly/{id:int}")]
    public async Task<IActionResult> DangXuLy(int id)
        => await SetTrangThai(id, "processing");

    // PUT /api/don-hang/dang-giao/{id}
    [HttpPut("dang-giao/{id:int}")]
    public async Task<IActionResult> DangGiao(int id)
        => await SetTrangThai(id, "shipping");

    // PUT /api/don-hang/da-giao/{id}
    [HttpPut("da-giao/{id:int}")]
    public async Task<IActionResult> DaGiao(int id)
        => await SetTrangThai(id, "completed");

    // PUT /api/don-hang/huy-don/{id}
    [HttpPut("huy-don/{id:int}")]
    public async Task<IActionResult> HuyDon(int id)
        => await SetTrangThai(id, "canceled");

    private async Task<IActionResult> SetTrangThai(int id, string trangThai)
    {
        var ok = await _repo.UpdateTrangThaiAsync(id, trangThai);
        if (!ok) return NotFound();
        return NoContent();
    }

    // DELETE /api/don-hang/xoa/{id}
    [HttpDelete("xoa/{id:int}")]
    public async Task<IActionResult> Xoa(int id)
    {
        var ok = await _repo.SoftDeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}
