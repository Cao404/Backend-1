using Microsoft.Data.SqlClient;

namespace SellerHub.Api.Data;

public sealed class SqlConnectionFactory
{
    private readonly string _cs;

    public SqlConnectionFactory(IConfiguration config)
    {
        _cs = config.GetConnectionString("Default")
              ?? throw new InvalidOperationException("Missing ConnectionStrings:Default");
    }

    public SqlConnection Create() => new SqlConnection(_cs);

    // ✅ thêm dòng này để code cũ (_factory.CreateConnection()) không lỗi
    public SqlConnection CreateConnection() => Create();
}
