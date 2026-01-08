namespace SellerHub.Api.Dtos;

public class OrderCustomerDto
{
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string? Email { get; set; }
    public string? Avatar { get; set; } // optional
}

public class OrderPaymentDto
{
    public string Method { get; set; } = "COD";
    public bool Paid { get; set; } = false;
}

public class OrderItemDto
{
    public int? ProductId { get; set; }
    public string? Emoji { get; set; }  // optional
    public string Name { get; set; } = "";
    public int Quantity { get; set; } = 1;
    public decimal Price { get; set; } = 0;
}

public class DonHangCreateReq
{
    public string Code { get; set; } = "";              // "#DH-12345"
    public int? CustomerId { get; set; }                // optional
    public OrderCustomerDto Customer { get; set; } = new();
    public List<OrderItemDto> Products { get; set; } = new();
    public OrderPaymentDto Payment { get; set; } = new();
    public string Status { get; set; } = "pending";
    public string? ShippingAddress { get; set; }
    public string? Note { get; set; }
    public DateTime? CreatedAt { get; set; }            // optional
}

public class DonHangListDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public OrderCustomerDto Customer { get; set; } = new();
    public decimal Total { get; set; }
    public OrderPaymentDto Payment { get; set; } = new();
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; }
}

public class DonHangDetailDto : DonHangListDto
{
    public string? ShippingAddress { get; set; }
    public string? Note { get; set; }
    public List<OrderItemDto> Products { get; set; } = new();
}

public class UpdateTrangThaiReq
{
    public string Status { get; set; } = "pending";
}
