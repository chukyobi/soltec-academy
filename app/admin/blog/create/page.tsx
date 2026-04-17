import CreateBlogForm from "@/components/admin/CreateBlogForm";

export default function CreateBlogPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Create New Blog Post</h2>
      </div>
      <CreateBlogForm />
    </div>
  );
}
