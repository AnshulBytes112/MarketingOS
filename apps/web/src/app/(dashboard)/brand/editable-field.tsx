'use client';

import { useState } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBrandDnaField } from './actions';

interface EditableFieldProps {
  versionId: string;
  brandId: string;
  field: string;
  value: any;
  type?: 'text' | 'textarea' | 'array' | 'json';
  className?: string;
  renderValue?: (value: any) => React.ReactNode;
}

export function EditableField({
  versionId,
  brandId,
  field,
  value,
  type = 'text',
  className = '',
  renderValue
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<any>(
    type === 'json' ? JSON.stringify(value || [], null, 2) : value
  );
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newValue: any) => updateBrandDnaField({
      versionId,
      brandId,
      field: field as any,
      value: newValue
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-dna', brandId] });
      setIsEditing(false);
    },
    onError: (err) => {
      console.error('Failed to update field:', err);
      alert('Failed to update field. You might not have permission.');
    }
  });

  const handleSave = () => {
    let finalValue = editValue;
    if (type === 'json') {
      try {
        finalValue = JSON.parse(editValue);
      } catch (err) {
        alert('Invalid JSON format');
        return;
      }
    }
    mutation.mutate(finalValue);
  };

  const handleCancel = () => {
    setEditValue(type === 'json' ? JSON.stringify(value || [], null, 2) : value);
    setIsEditing(false);
  };

  const handleArrayChange = (index: number, newValue: string) => {
    const newArr = [...editValue];
    newArr[index] = newValue;
    setEditValue(newArr);
  };

  const addArrayItem = () => {
    setEditValue([...(editValue || []), '']);
  };

  const removeArrayItem = (index: number) => {
    const newArr = [...editValue];
    newArr.splice(index, 1);
    setEditValue(newArr);
  };

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        {type === 'textarea' ? (
          <textarea
            className="w-full bg-[#0B0A11] border border-purple-500/30 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-purple-500 min-h-[100px]"
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={mutation.isPending}
          />
        ) : type === 'json' ? (
          <textarea
            className="w-full bg-[#0B0A11] border border-purple-500/30 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-purple-500 min-h-[200px] font-mono"
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={mutation.isPending}
          />
        ) : type === 'array' ? (
          <div className="space-y-2">
            {(editValue || []).map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 bg-[#0B0A11] border border-purple-500/30 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  value={item}
                  onChange={(e) => handleArrayChange(i, e.target.value)}
                  disabled={mutation.isPending}
                />
                <button
                  onClick={() => removeArrayItem(i)}
                  className="text-gray-500 hover:text-rose-400 p-1"
                  disabled={mutation.isPending}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addArrayItem}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium"
              disabled={mutation.isPending}
            >
              + Add Item
            </button>
          </div>
        ) : (
          <input
            type="text"
            className="w-full bg-[#0B0A11] border border-purple-500/30 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={mutation.isPending}
          />
        )}
        
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCancel}
            disabled={mutation.isPending}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-xs font-medium text-white flex items-center gap-1"
          >
            {mutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      {renderValue ? renderValue(value) : (
        <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
          {value || 'Not generated yet.'}
        </div>
      )}
      <button
        onClick={() => {
          setEditValue(type === 'json' ? JSON.stringify(value || [], null, 2) : value);
          setIsEditing(true);
        }}
        className="absolute top-0 right-0 p-1.5 rounded-lg bg-black/40 text-gray-400 hover:text-white hover:bg-purple-600/50 opacity-0 group-hover:opacity-100 transition-all border border-white/5"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
