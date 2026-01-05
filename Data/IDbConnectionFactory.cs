using System.Data;

namespace User.Api.Data
{
    public interface IDbConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}
