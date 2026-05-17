namespace HospitalManagement.Config
{
    public class EmailConfig
    {
        public const string SectionName = "EmailSettings";
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public string SenderEmail { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
