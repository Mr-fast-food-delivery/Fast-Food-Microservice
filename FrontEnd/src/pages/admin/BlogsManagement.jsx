import { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  PhotoIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { blogService, fileService } from '../../services/api';
import Modal from '../../components/ui/Modal';

// Mock data as fallback
const mockBlogs = [
  {
    id: 1,
    title: 'Lợi ích sức khỏe của gạo lứt và cách nấu gạo lứt ngon',
    description: 'Tìm hiểu về những lợi ích tuyệt vời của gạo lứt đối với sức khỏe và các mẹo nấu gạo lứt ngon, dẻo như gạo trắng.',
    content: '<p>Gạo lứt là một loại gạo chưa qua xay xát hoặc chỉ xay sơ qua lớp vỏ trấu bên ngoài...</p>',
    createAt: '2025-04-15T10:30:00',
    image: {
      id: 1,
      url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3'
    },
    user: {
      id: 1,
      name: 'Minh Thành',
      username: 'admin'
    },
    tags: [
      { id: 1, name: 'Sức khỏe' },
      { id: 2, name: 'Gạo lứt' }
    ]
  },
  {
    id: 2,
    title: '5 công thức làm bánh từ bột mì nguyên cám cho người ăn kiêng',
    description: 'Những công thức làm bánh lành mạnh từ bột mì nguyên cám giàu dinh dưỡng và thích hợp cho người đang ăn kiêng.',
    content: '<p>Bánh từ bột mì nguyên cám không chỉ thơm ngon mà còn rất tốt cho sức khỏe...</p>',
    createAt: '2025-04-10T14:20:00',
    image: {
      id: 2,
      url: 'https://images.unsplash.com/photo-1606101273945-e9eba91c0dc4?ixlib=rb-4.0.3'
    },
    user: {
      id: 1,
      name: 'Thu Hương',
      username: 'admin'
    },
    tags: [
      { id: 3, name: 'Công thức' },
      { id: 4, name: 'Bánh mì' },
      { id: 5, name: 'Ăn kiêng' }
    ]
  }
];

const BlogsManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
  const [currentBlog, setCurrentBlog] = useState(null);
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    imageFile: null,
    imageId: null,
    imageUrl: null,
    tags: []
  });

  // Available tags (you might want to fetch these from API)
  const availableTags = [
    { id: 1, name: 'Sức khỏe' },
    { id: 2, name: 'Gạo lứt' },
    { id: 3, name: 'Dinh dưỡng' },
    { id: 4, name: 'Ẩm thực' },
    { id: 5, name: 'Công thức' },
    { id: 6, name: 'Hạt dinh dưỡng' },
    { id: 7, name: 'Tim mạch' },
    { id: 8, name: 'Sữa thực vật' },
    { id: 9, name: 'Rau củ hữu cơ' },
    { id: 10, name: 'Mẹo hữu ích' },
    { id: 11, name: 'Ăn sạch' },
    { id: 12, name: 'Thực đơn' }
  ];
  // Fetch blogs
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogs();
      console.log('📚 Raw blog response:', response);
      console.log('📚 Blog data structure:', JSON.stringify(response?.data, null, 2));
      
      if (response && response.data) {
        // Debug each blog's image data
        response.data.forEach((blog, index) => {
          console.log(`📝 Blog ${index + 1} (${blog.title}):`, {
            id: blog.id,
            hasImage: !!blog.image,
            imageData: blog.image
          });
        });
        setBlogs(response.data);
      } else {
        console.warn('API returned no data, using mock data');
        setBlogs(mockBlogs);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs(mockBlogs);
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }  }, []);

  // Debug effect to track formData changes
  useEffect(() => {
    console.log('🔄 FormData changed:', formData);
    console.log('🖼️ Current imageUrl:', formData.imageUrl);
    console.log('📁 Current imageFile:', formData.imageFile?.name);
    console.log('🆔 Current imageId:', formData.imageId);
  }, [formData]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      console.log('📤 Uploading image:', file.name);
      const uploadResponse = await fileService.uploadImage(file);
      console.log('📥 Upload response:', uploadResponse);
      console.log('📥 Response data structure:', JSON.stringify(uploadResponse.data, null, 2));
      
      if (uploadResponse && uploadResponse.data && uploadResponse.data.data) {
        // Backend returns: { success: true, message: "...", data: { id, url, name } }
        const imageData = uploadResponse.data.data;
        console.log('🖼️ Image data extracted:', imageData);
        console.log('🔗 Image URL:', imageData.url);
        console.log('🆔 Image ID:', imageData.id);
          setFormData(prev => {
          const newFormData = {
            ...prev,
            imageFile: file,
            imageId: imageData.id,
            imageUrl: imageData.url // Store URL for preview
          };
          console.log('📝 Updated formData:', newFormData);
          return newFormData;
        });
        toast.success('Ảnh đã được tải lên thành công');
        console.log('✅ Image uploaded successfully with ID:', imageData.id);
        
        // Force a slight delay to ensure state update
        setTimeout(() => {
          console.log('⏰ Delayed check - formData after upload:', {
            imageId: imageData.id,
            imageUrl: imageData.url,
            imageFile: file?.name
          });
        }, 100);
      } else {
        console.error('❌ Unexpected response structure:', uploadResponse);
        toast.error('Phản hồi không hợp lệ từ server');
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      toast.error('Không thể tải lên ảnh');
    }
  };

  // Handle tag selection
  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };
  // Open modal for creating new blog
  const handleCreateNew = () => {
    setCurrentBlog(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      imageFile: null,
      imageId: null,
      imageUrl: null,
      tags: []
    });
    setModalType('create');
    setShowModal(true);
  };
  // Open modal for editing blog
  const handleEdit = (blog) => {
    setCurrentBlog(blog);
    setFormData({
      title: blog.title || '',
      description: blog.description || '',
      content: blog.content || '',
      imageFile: null,
      imageId: blog.image?.id || null,
      imageUrl: blog.image?.url || null,
      tags: blog.tags?.map(tag => tag.id) || []
    });
    setModalType('edit');
    setShowModal(true);
  };

  // Open modal for viewing blog
  const handleView = (blog) => {
    setCurrentBlog(blog);
    setModalType('view');
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.content.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bài viết');
      return;
    }

    try {
      setLoading(true);
      
      const blogData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        imageId: formData.imageId,
        username: 'admin', // This should come from auth context
        tags: formData.tags
      };

      console.log('Submitting blog data:', blogData);

      if (modalType === 'create') {
        await blogService.createBlog(blogData);
        toast.success('Tạo bài viết thành công');
      } else {
        await blogService.updateBlog(currentBlog.id, blogData);
        toast.success('Cập nhật bài viết thành công');
      }

      setShowModal(false);
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Không thể lưu bài viết');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete blog
  const handleDelete = async (blogId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    try {
      await blogService.deleteBlog(blogId);
      setBlogs(blogs.filter(blog => blog.id !== blogId));
      toast.success('Xóa bài viết thành công');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Không thể xóa bài viết');
    }
  };

  // Filter blogs based on search term
  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.tags?.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'Không có ngày';
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải danh sách bài viết...</p>
        </div>
      </div>
    );
  }

  // Modal content for blog viewing
  const viewModeContent = (
    <div className="space-y-6">
      {currentBlog?.image && (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <img
            src={currentBlog.image.url}
            alt={currentBlog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentBlog?.title}</h2>
        <p className="text-gray-600 mb-4">{currentBlog?.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center">
            <UserIcon className="h-4 w-4 mr-1" />
            {currentBlog?.user?.name || 'Unknown'}
          </span>
          <span className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {formatDate(currentBlog?.createAt)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {currentBlog?.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800"
            >
              {tag.name}
            </span>
          ))}
        </div>
      
        <div 
          className="prose max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: currentBlog?.content }}
        />
      </div>
    </div>
  );

  // Modal content for create/edit
  const editModeContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề bài viết
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập tiêu đề bài viết..."
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả ngắn
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập mô tả ngắn về bài viết..."
            required
          />        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh đại diện
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />          
          {/* Image Preview */}
          {(() => {
            const shouldShowPreview = formData.imageFile || formData.imageUrl || (currentBlog?.image && modalType === 'edit');
            console.log('🔍 Preview condition check:', {
              imageFile: !!formData.imageFile,
              imageUrl: !!formData.imageUrl, 
              currentBlogImage: !!currentBlog?.image,
              modalType,
              shouldShowPreview
            });
            
            return shouldShowPreview ? (
              <div className="mt-3">
                <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                  {(() => {
                    console.log('🎨 Rendering preview - imageUrl:', formData.imageUrl);
                    console.log('🎨 Rendering preview - imageFile:', formData.imageFile?.name);
                    console.log('🎨 Rendering preview - currentBlog image:', currentBlog?.image?.url);
                    
                    if (formData.imageUrl) {
                      console.log('✅ Using uploaded image URL:', formData.imageUrl);
                      return (
                        <img
                          src={formData.imageUrl}
                          alt="Uploaded image"
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('🖼️ Image loaded successfully from URL')}
                          onError={() => console.log('❌ Image failed to load from URL')}
                        />
                      );
                    } else if (formData.imageFile) {
                      console.log('✅ Using local file preview');
                      return (
                        <img
                          src={URL.createObjectURL(formData.imageFile)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      );
                    } else if (currentBlog?.image && modalType === 'edit') {
                      console.log('✅ Using existing blog image');
                      return (
                        <img
                          src={currentBlog.image.url}
                          alt="Current image"
                          className="w-full h-full object-cover"
                        />
                      );
                    } else {
                      console.log('📷 No image to display');
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <PhotoIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            ) : null;
          })()}
          
          {formData.imageFile && (
            <p className="mt-1 text-sm text-green-600">
              ✅ Ảnh đã được chọn: {formData.imageFile.name}
            </p>
          )}
          {formData.imageId && (
            <p className="mt-1 text-sm text-blue-600">
              ✅ ID ảnh đã tải lên: {formData.imageId}
            </p>
          )}
          {!formData.imageFile && !formData.imageId && modalType === 'create' && (
            <p className="mt-1 text-sm text-gray-500">
              Chọn ảnh để hiển thị preview
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                  formData.tags.includes(tag.id)
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {formData.tags.includes(tag.id) && (
                  <CheckIcon className="w-3 h-3 mr-1" />
                )}
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung bài viết
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập nội dung bài viết (hỗ trợ HTML)..."
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Bạn có thể sử dụng HTML để định dạng nội dung
          </p>
        </div>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bài viết</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý nội dung blog và bài viết trên website
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Tạo bài viết mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tổng bài viết</dt>
                  <dd className="text-lg font-medium text-gray-900">{blogs.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Bài viết tháng này</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {blogs.filter(blog => {
                      const blogDate = new Date(blog.createAt);
                      const currentDate = new Date();
                      return blogDate.getMonth() === currentDate.getMonth() && 
                             blogDate.getFullYear() === currentDate.getFullYear();
                    }).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TagIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tổng tags</dt>
                  <dd className="text-lg font-medium text-gray-900">{availableTags.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm bài viết theo tiêu đề, mô tả, tác giả hoặc tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bài viết
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tác giả
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentBlogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-24">
                      {blog.image ? (
                        <img
                          className="h-16 w-24 object-cover rounded-md"
                          src={blog.image.url}
                          alt={blog.title}
                        />
                      ) : (
                        <div className="h-16 w-24 bg-gray-200 rounded-md flex items-center justify-center">
                          <PhotoIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2 max-w-md">
                        {blog.title}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-1 max-w-md">
                        {blog.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="text-sm text-gray-900">
                      {blog.user?.name || blog.user?.username || 'Unknown'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {blog.tags?.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                      >
                        {tag.name}
                      </span>
                    ))}
                    {blog.tags?.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{blog.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(blog.createAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(blog)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(blog)}
                      className="text-green-600 hover:text-green-900"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Xóa"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currentBlogs.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có bài viết nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Không tìm thấy bài viết nào phù hợp với tìm kiếm.'
                : 'Hãy bắt đầu bằng cách tạo bài viết mới.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị{' '}
                <span className="font-medium">{indexOfFirstBlog + 1}</span>
                {' '}đến{' '}
                <span className="font-medium">{Math.min(indexOfLastBlog, filteredBlogs.length)}</span>
                {' '}trong{' '}
                <span className="font-medium">{filteredBlogs.length}</span>
                {' '}kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Trang trước</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === index + 1
                        ? 'z-10 bg-green-50 border-green-500 text-green-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Trang tiếp</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={
          modalType === 'create' ? 'Tạo bài viết mới' : 
          modalType === 'edit' ? 'Chỉnh sửa bài viết' : 
          'Chi tiết bài viết'
        }
        size={modalType === 'view' ? 'lg' : 'xl'}
        footer={modalType !== 'view' ? (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : (modalType === 'create' ? 'Tạo bài viết' : 'Cập nhật')}
            </button>
          </div>
        ) : null}
        contentClassName={modalType === 'view' ? 'p-0' : ''}
      >
        {modalType === 'view' ? viewModeContent : editModeContent}
      </Modal>
    </div>
  );
};

export default BlogsManagement;
