using Microsoft.Data.SqlClient;

public interface ISqlConnectionFactory
{
    SqlConnection Create();
}

public class SqlConnectionFactory : ISqlConnectionFactory
{
    private readonly string _cs;
    private string v;

    public SqlConnectionFactory(IConfiguration config)
    {
        _cs = config.GetConnectionString("Default")
              ?? throw new InvalidOperationException("Missing ConnectionStrings:Default");
    }

    public SqlConnectionFactory(string v)
    {
        this.v = v;
    }

    public SqlConnection Create() => new SqlConnection(_cs);
}
