using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace HospitalManagement.Storage
{
    public class LocalDiskStorage : IFileStorage
    {
        private readonly string _basePath;
        private readonly ILogger<LocalDiskStorage> _logger;

        public LocalDiskStorage(IWebHostEnvironment env, ILogger<LocalDiskStorage> logger)
        {
            _basePath = Path.Combine(env.ContentRootPath, "FileStorage");
            _logger = logger;
        }

        public async Task<StoredFileInfo> UploadAsync(Stream stream, string originalFileName, string contentType, string folderKey, CancellationToken cancellationToken = default)
        {
            var ext = Path.GetExtension(originalFileName);
            if (string.IsNullOrEmpty(ext)) ext = ".bin";

            var storedFileName = $"{Guid.NewGuid():N}{ext}";
            var relativePath = Path.Combine(folderKey, storedFileName);
            var fullPath = Path.Combine(_basePath, relativePath);

            Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

            await using var fs = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true);
            await stream.CopyToAsync(fs, cancellationToken);

            var size = new FileInfo(fullPath).Length;
            _logger.LogInformation("File uploaded: {Path} ({Size} bytes)", fullPath, size);

            return new StoredFileInfo
            {
                StorageKey = relativePath.Replace("\\", "/"),
                StoredFileName = storedFileName,
                FileSize = size
            };
        }

        public Task<Stream> OpenReadAsync(string storageKey, CancellationToken cancellationToken = default)
        {
            var fullPath = Path.Combine(_basePath, storageKey.Replace("/", Path.DirectorySeparatorChar.ToString()));
            if (!File.Exists(fullPath))
                throw new FileNotFoundException("File not found", storageKey);

            Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, useAsync: true);
            return Task.FromResult(stream);
        }

        public Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default)
        {
            var fullPath = Path.Combine(_basePath, storageKey.Replace("/", Path.DirectorySeparatorChar.ToString()));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("File deleted: {Path}", fullPath);
            }
            return Task.CompletedTask;
        }
    }
}