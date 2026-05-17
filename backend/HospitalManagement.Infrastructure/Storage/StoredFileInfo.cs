namespace HospitalManagement.Storage
{
    public class StoredFileInfo
    {
        public string StorageKey { get; set; } = string.Empty;
        public string StoredFileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
    }
}
