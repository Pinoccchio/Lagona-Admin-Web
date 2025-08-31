'use client';

import { useState, useEffect } from 'react';
import { auditService, type AuditLog, type AuditFilters } from '@/services/auditService';

interface AuditHistoryProps {
  entityType?: string;
  entityId?: string;
  showFilters?: boolean;
  compact?: boolean;
}

export default function AuditHistory({ 
  entityType, 
  entityId, 
  showFilters = true,
  compact = false 
}: AuditHistoryProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  
  // Filters
  const [filterActionType, setFilterActionType] = useState<string>('');
  const [filterDateRange, setFilterDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchAuditLogs();
  }, [entityType, entityId, filterActionType, filterDateRange]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: AuditFilters = {};
      
      if (entityType) filters.entity_type = entityType;
      if (entityId) filters.entity_id = entityId;
      if (filterActionType) filters.action_type = filterActionType;
      
      // Apply date range filter
      const now = new Date();
      switch (filterDateRange) {
        case 'today':
          filters.start_date = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          filters.start_date = weekAgo.toISOString();
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filters.start_date = monthAgo.toISOString();
          break;
      }
      
      filters.limit = compact ? 10 : 100;

      const logs = await auditService.getAuditLogs(filters);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit history');
    } finally {
      setLoading(false);
    }
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 48) {
      return 'Yesterday at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const renderChanges = (log: AuditLog) => {
    if (!log.old_values && !log.new_values) return null;
    
    const changes = auditService.formatChanges(log.old_values, log.new_values);
    if (changes.length === 0) return null;

    return (
      <div className="mt-3 space-y-1">
        <div className="text-sm font-medium text-gray-700">Changes:</div>
        <ul className="text-sm text-gray-600 space-y-1">
          {changes.map((change, index) => (
            <li key={index} className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              <span>{change}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${compact ? '' : 'bg-white rounded-xl p-6 shadow-sm'}`}>
      {/* Header and Filters */}
      {!compact && (
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit History</h3>
          
          {showFilters && (
            <div className="flex gap-4">
              <select
                value={filterActionType}
                onChange={(e) => setFilterActionType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Created</option>
                <option value="UPDATE">Updated</option>
                <option value="DELETE">Deleted</option>
                <option value="CONFIG_CHANGE">Config Changed</option>
                <option value="TOP_UP">Top-up</option>
              </select>

              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Audit Logs */}
      {auditLogs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No audit history found
        </div>
      ) : (
        <div className="space-y-3">
          {auditLogs.map((log) => {
            const isExpanded = expandedLogs.has(log.id);
            const actionColor = auditService.getActionTypeColor(log.action_type);
            
            return (
              <div
                key={log.id}
                className={`border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                  compact ? 'text-sm' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${actionColor}`}>
                        {log.action_type}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {log.admin_name || log.admin_email}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(log.created_at)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-700">
                      {log.action_type === 'CREATE' && (
                        <span>Created new {auditService.getEntityTypeLabel(log.entity_type)}: <strong>{log.entity_name}</strong></span>
                      )}
                      {log.action_type === 'UPDATE' && (
                        <span>Updated {auditService.getEntityTypeLabel(log.entity_type)}: <strong>{log.entity_name}</strong></span>
                      )}
                      {log.action_type === 'DELETE' && (
                        <span>Deleted {auditService.getEntityTypeLabel(log.entity_type)}: <strong>{log.entity_name}</strong></span>
                      )}
                      {log.action_type === 'CONFIG_CHANGE' && (
                        <span>Modified system configuration: <strong>{log.entity_name}</strong></span>
                      )}
                      {log.changes_summary && (
                        <div className="mt-1 text-gray-600">{log.changes_summary}</div>
                      )}
                    </div>

                    {/* Expandable details */}
                    {isExpanded && renderChanges(log)}
                  </div>

                  {/* Expand/Collapse button */}
                  {(log.old_values || log.new_values) && (
                    <button
                      onClick={() => toggleLogExpansion(log.id)}
                      className="ml-4 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {!compact && auditLogs.length >= 100 && (
        <div className="text-center pt-4">
          <button className="text-primary-orange hover:text-orange-700 font-medium text-sm">
            Load more audit logs
          </button>
        </div>
      )}
    </div>
  );
}