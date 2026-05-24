import React, { useState, useEffect } from 'react';

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
}

interface SidebarProps {
  wikiPath: string;
  onOpenInObsidian: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ wikiPath, onOpenInObsidian }) => {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWikiStructure();
  }, []);

  const loadWikiStructure = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.getWikiStructure();
      if (result.success && result.tree) {
        setTree(result.tree);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderTree = (nodes: TreeNode[], path: string = '') => {
    return nodes.map((node) => {
      const fullPath = path ? `${path}/${node.name}` : node.name;

      if (node.type === 'folder') {
        const isExpanded = expandedFolders.has(fullPath);
        return (
          <div key={fullPath}>
            <div
              className="folder-item folder"
              onClick={() => toggleFolder(fullPath)}
            >
              <span className="folder-icon">{isExpanded ? '📂' : '📁'}</span>
              <span>{node.name}</span>
            </div>
            {isExpanded && node.children && (
              <div style={{ paddingLeft: '16px' }}>
                {renderTree(node.children, fullPath)}
              </div>
            )}
          </div>
        );
      }

      return (
        <div key={fullPath} className="folder-item">
          <span className="file-icon">📄</span>
          <span>{node.name}</span>
        </div>
      );
    });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="sidebar-title">Wiki Explorer</span>
          <button
            className="button button-secondary"
            onClick={onOpenInObsidian}
            style={{ padding: '4px 8px', fontSize: '11px' }}
          >
            Open in Obsidian
          </button>
        </div>
      </div>
      <div className="sidebar-content scrollable">
        {loading ? (
          <div className="empty-state">
            <p className="empty-state-text">Loading wiki structure...</p>
          </div>
        ) : tree.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No wiki found</p>
            <p className="empty-state-text">
              Create a wiki at: {wikiPath}
            </p>
          </div>
        ) : (
          renderTree(tree)
        )}
      </div>
    </div>
  );
};

export default Sidebar;