using Microsoft.Data.SqlClient;

namespace SellerHub.Api.Data;

public interface ISqlConnectionFactory
{
    SqlConnection Create();
}

public class SqlConnectionFactory : ISqlConnectionFactory
{
    private readonly IConfiguration _config;
    public SqlConnectionFactory(IConfiguration config) => _config = config;

    public SqlConnection Create()
    {
        var cs = _config.GetConnectionString("Default");
        return new SqlConnection(cs);
    }
}
