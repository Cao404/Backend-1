using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellerHub.Api.Data;
using SellerHub.Api.Models;

namespace SellerHub.Api.Controllers;

[ApiController]
[Route("api/admin/seller-applications")]
public class AdminSellerApplicationsController : ControllerBase
{
    private readonly SellerHubDbContext _db;
    public AdminSellerApplicationsController(SellerHubDbContext db) => _db = db;