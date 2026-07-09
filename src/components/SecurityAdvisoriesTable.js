import React, { useState, useMemo } from 'react';
import advisories from '../data/security-advisories.json';
import ossTags from '../data/oss-tags.json';

const formatVulnerableVersions = (versionsStr) => {
  if (!versionsStr) return 'See Advisory';
  
  // Split by comma and clean up whitespace
  const conditions = versionsStr.split(',').map(s => s.trim());
  
  // Group conditions by major.minor prefix
  const groups = {};
  
  conditions.forEach(cond => {
    // Extract the version number part (e.g. "4.2.0" from ">= 4.2.0")
    const match = cond.match(/(?:>=|>|<=|<)?\s*(\d+\.\d+)\.\d+/);
    if (match) {
      const majorMinor = match[1]; // e.g. "4.2"
      if (!groups[majorMinor]) {
        groups[majorMinor] = [];
      }
      groups[majorMinor].push(cond);
    } else {
      // Fallback for weird strings, just group them under 'other'
      if (!groups['other']) groups['other'] = [];
      groups['other'].push(cond);
    }
  });

  // Sort groups descending by major.minor
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === 'other') return 1;
    if (b === 'other') return -1;
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    for (let i = 0; i < 2; i++) {
      if ((partsA[i] || 0) > (partsB[i] || 0)) return -1;
      if ((partsA[i] || 0) < (partsB[i] || 0)) return 1;
    }
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {sortedKeys.map((key, idx) => (
        <span key={idx} style={{ whiteSpace: 'nowrap' }}>
          {groups[key].join(', ')}
        </span>
      ))}
    </div>
  );
};

const renderPatchedVersions = (repo, versionsStr) => {
  if (!versionsStr) return 'See Advisory';
  if (repo !== 'rabbitmq-server') return formatVulnerableVersions(versionsStr);

  const chunks = versionsStr.split(',').map(s => s.trim());
  
  // Sort chunks descending by major.minor.patch
  chunks.sort((a, b) => {
    // Extract version part ignoring any prefixes if present
    const vA = a.match(/(\d+\.\d+\.\d+)/)?.[1] || a;
    const vB = b.match(/(\d+\.\d+\.\d+)/)?.[1] || b;
    
    const partsA = vA.split('.').map(Number);
    const partsB = vB.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if ((partsA[i] || 0) > (partsB[i] || 0)) return -1;
      if ((partsA[i] || 0) < (partsB[i] || 0)) return 1;
    }
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {chunks.map((chunk, idx) => {
        const match = chunk.match(/\d+\.\d+\.\d+/);
        if (!match) return <span key={idx}>{chunk}</span>;
        
        const version = match[0];
        const isOSS = ossTags.includes(version);
        
        if (isOSS) {
          return (
            <a 
              key={idx} 
              href={`https://github.com/rabbitmq/rabbitmq-server/releases/tag/v${version}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                backgroundColor: '#fff0e6', 
                color: '#e26d23',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.85em',
                border: '1px solid #fce3d4',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
              title={`Available to open source users and VMware Tanzu RabbitMQ customers`}
            >
              {chunk} (OSS)
            </a>
          );
        } else {
          const parts = version.split('.');
          const commercialUrl = `https://techdocs.broadcom.com/us/en/vmware-tanzu/data-solutions/open-source-rabbitmq/${parts[0]}-${parts[1]}/opn-src-rabbitmq/site-release-notes.html#open-source-rabbitmq-v${version}`;
          
          return (
            <a 
              key={idx} 
              href={commercialUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                backgroundColor: '#e6f4ea', 
                color: '#1a7f37',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.85em',
                border: '1px solid #cce8d6',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
              title="Available only to VMware Tanzu RabbitMQ customers"
            >
              {chunk} (Enterprise Support)
            </a>
          );
        }
      })}
    </div>
  );
};

export default function SecurityAdvisoriesTable() {
  const [sortConfig, setSortConfig] = useState({ key: 'published_at', direction: 'desc' });
  const [filter, setFilter] = useState('');

  const severityWeight = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const sortedAdvisories = useMemo(() => {
    let sortableItems = [...advisories];
    
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      sortableItems = sortableItems.filter(item => 
        (item.repo && item.repo.toLowerCase().includes(lowerFilter)) ||
        (item.cve_id && item.cve_id.toLowerCase().includes(lowerFilter)) ||
        (item.ghsa_id && item.ghsa_id.toLowerCase().includes(lowerFilter)) ||
        (item.summary && item.summary.toLowerCase().includes(lowerFilter)) ||
        (item.published_at && item.published_at.toLowerCase().includes(lowerFilter)) ||
        (item.patched_versions && item.patched_versions.toLowerCase().includes(lowerFilter)) ||
        (item.vulnerable_versions && item.vulnerable_versions.toLowerCase().includes(lowerFilter)) ||
        (item.severity && item.severity.toLowerCase().includes(lowerFilter))
      );
    }
    
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'severity') {
          const weightA = severityWeight(a.severity);
          const weightB = severityWeight(b.severity);
          if (weightA < weightB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (weightA > weightB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [sortConfig, filter]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (!sortConfig || sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
  };
  
  const severityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return '#d73a4a';
      case 'high': return '#cb2431';
      case 'medium': return '#e26d23';
      case 'low': return '#1a7f37';
      default: return 'inherit';
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <input 
        type="text" 
        placeholder="Filter advisories by Advisory ID, CVE ID, Date Published, Severity, Repository, Summary, Affected Versions, or Patched Versions"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ 
          width: '100%', 
          padding: '10px', 
          marginBottom: '20px', 
          borderRadius: '4px', 
          border: '1px solid var(--ifm-color-emphasis-400)',
          backgroundColor: 'var(--ifm-background-surface-color)',
          color: 'var(--ifm-font-color-base)'
        }}
      />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', display: 'table' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', borderBottom: '2px solid var(--ifm-color-emphasis-300)' }}>Advisory ID &amp; CVE ID</th>
              <th style={{ cursor: 'pointer', padding: '10px', borderBottom: '2px solid var(--ifm-color-emphasis-300)' }} onClick={() => requestSort('published_at')}>Date Published{getSortIndicator('published_at')}</th>
              <th style={{ cursor: 'pointer', padding: '10px', borderBottom: '2px solid var(--ifm-color-emphasis-300)' }} onClick={() => requestSort('severity')}>Severity{getSortIndicator('severity')}</th>
              <th style={{ cursor: 'pointer', padding: '10px', borderBottom: '2px solid var(--ifm-color-emphasis-300)' }} onClick={() => requestSort('repo')}>Repository{getSortIndicator('repo')}</th>
              <th style={{ padding: '10px', borderBottom: '2px solid var(--ifm-color-emphasis-300)' }}>Summary</th>
              <th style={{ padding: '10px', borderBottom: '2px solid var(--ifm-color-emphasis-300)' }}>Affected Versions</th>
              <th style={{ padding: '10px', borderBottom: '2px solid var(--ifm-color-emphasis-300)' }}>Patched Versions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAdvisories.map((adv) => (
              <tr key={adv.ghsa_id} style={{ borderBottom: '1px solid var(--ifm-color-emphasis-200)' }}>
                <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <a href={adv.url} target="_blank" rel="noopener noreferrer">
                      {adv.ghsa_id}
                    </a>
                  </div>
                  <div>
                    {(adv.cve_id && adv.cve_id.toLowerCase() !== 'pending') ? (
                      <a href={`https://nvd.nist.gov/vuln/detail/${adv.cve_id}`} target="_blank" rel="noopener noreferrer">
                        {adv.cve_id}
                      </a>
                    ) : (
                      <span style={{ fontStyle: 'italic', color: 'var(--ifm-color-emphasis-600)' }}>CVE ID pending</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{adv.published_at}</td>
                <td style={{ padding: '10px', fontWeight: 'bold', color: severityColor(adv.severity) }}>
                  {adv.severity ? adv.severity.charAt(0).toUpperCase() + adv.severity.slice(1) : 'Unknown'}
                </td>
                <td style={{ padding: '10px' }}>
                  <a href={`https://github.com/rabbitmq/${adv.repo}`} target="_blank" rel="noopener noreferrer">
                    <code>{adv.repo}</code>
                  </a>
                </td>
                <td style={{ padding: '10px', fontSize: '0.9em' }}>{adv.summary}</td>
                <td style={{ padding: '10px', fontSize: '0.85em' }}>{formatVulnerableVersions(adv.vulnerable_versions)}</td>
                <td style={{ padding: '10px', fontSize: '0.85em' }}>{renderPatchedVersions(adv.repo, adv.patched_versions)}</td>
              </tr>
            ))}
            {sortedAdvisories.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>No public advisories found matching the filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
