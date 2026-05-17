namespace HospitalManagement.Common
{
    public class PaginationParams
    {
        private const int MaxPageSize = 100;
        private int _pageSize = 10;
        public int Page { get; set; } = 1;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }
    }

    public class QueryParameters : PaginationParams
    {
        public string? SearchTerm { get; set; }
        public string? OrderBy { get; set; }
        public bool IsAscending { get; set; } = true;
    }

    public class AppointmentQueryParameters : QueryParameters
    {
        public Guid? DoctorId { get; set; }
        public Guid? PatientId { get; set; }
        public string? Status { get; set; }
        public DateTimeOffset? DateFrom { get; set; }
        public DateTimeOffset? DateTo { get; set; }
    }

    public class DoctorQueryParameters : QueryParameters
    {
        public Guid? DepartmentId { get; set; }
    }
}
