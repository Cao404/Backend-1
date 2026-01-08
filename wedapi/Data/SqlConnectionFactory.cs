using Microsoft.Data.SqlClient;

public interface ISqlConnectionFactory
{
    SqlConnection Create();
}

public class SqlConnectionFactory : ISqlConnectionFactory
{
    private readonly string _cs;
    private readonly string? v; // Made nullable to address CS8618

    public SqlConnectionFactory(IConfiguration config)
    {
        _cs = config.GetConnectionString("Default")
              ?? throw new InvalidOperationException("Missing ConnectionStrings:Default");
    }

    public SqlConnectionFactory(string v)
    {
        this.v = v;
        _cs = v; // Ensure _cs is initialized in this constructor as well
    }

    public SqlConnection Create() => new SqlConnection(_cs);
}
