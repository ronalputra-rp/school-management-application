import ClassDirectoryTable from "../components/ClassDirectoryTable.jsx";
import ParentDirectorySection from "../components/ParentDirectorySection.jsx";

export default function DirectoryPage() {
    return (
        <div className="space-y-8">
            <ClassDirectoryTable />
            <ParentDirectorySection />
        </div>
    );
}
