'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit2, Trash2, Users, Building } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ClientForm from '@/components/ClientForm'
import Spinner from '@/components/ui/Spinner'
import { apiRequest } from '@/lib/api'

interface Client {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  notes?: string | null
  _count?: { projects: number }
}

export default function ClientsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiRequest<Client[]>('/api/clients'),
  })

  const createMutation = useMutation({
    mutationFn: (data: Omit<Client, 'id'>) =>
      apiRequest<Client>('/api/clients', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setIsCreateOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Client) =>
      apiRequest<Client>(`/api/clients/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setEditClient(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/clients/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q)
    )
  })

  const handleDelete = (client: Client) => {
    if (confirm(`Delete client "${client.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(client.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">Clients</h1>
          <p className="text-[15px] text-[#6E6E73] mt-1">{clients.length} total clients</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEAEB2]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full bg-[#F5F5F7] border-0 rounded-[10px] pl-9 pr-4 py-2.5 text-[14px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0066CC]/30 transition-all"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={48} className="mx-auto mb-4 text-[#AEAEB2] opacity-30" />
          <p className="text-[16px] font-medium text-[#1D1D1F]">No clients found</p>
          <p className="text-[14px] text-[#6E6E73] mt-1">Add your first client to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.05] bg-[#FAFAFA]">
                <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Name</th>
                <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Company</th>
                <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Email</th>
                <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Projects</th>
                <th className="text-right text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-[#F5F5F7] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0066CC]/15 text-[#0066CC] flex items-center justify-center text-[13px] font-semibold flex-shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[14px] font-medium text-[#1D1D1F]">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-[14px] text-[#6E6E73]">
                      {client.company ? (
                        <>
                          <Building size={14} className="text-[#AEAEB2]" />
                          {client.company}
                        </>
                      ) : (
                        <span className="text-[#AEAEB2]">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#6E6E73]">
                    {client.email || <span className="text-[#AEAEB2]">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[14px] text-[#6E6E73]">{client._count?.projects || 0} projects</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditClient(client)}
                        className="p-1.5 text-[#AEAEB2] hover:text-[#0066CC] hover:bg-[#0066CC]/8 rounded-[8px] transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
                        className="p-1.5 text-[#AEAEB2] hover:text-[#FF3B30] hover:bg-[#FF3B30]/8 rounded-[8px] transition-colors"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Client">
        <ClientForm
          onSubmit={async (data) => { await createMutation.mutateAsync(data as Omit<Client, 'id'>) }}
          isLoading={createMutation.isPending}
        />
        {createMutation.isError && (
          <p className="text-[13px] text-[#FF3B30] mt-3">{createMutation.error?.message}</p>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editClient} onClose={() => setEditClient(null)} title="Edit Client">
        {editClient && (
          <ClientForm
            defaultValues={{
              name: editClient.name,
              email: editClient.email ?? undefined,
              phone: editClient.phone ?? undefined,
              company: editClient.company ?? undefined,
              notes: editClient.notes ?? undefined,
            }}
            onSubmit={async (data) => { await updateMutation.mutateAsync({ id: editClient.id, ...data }) }}
            isLoading={updateMutation.isPending}
            submitLabel="Save Changes"
          />
        )}
        {updateMutation.isError && (
          <p className="text-[13px] text-[#FF3B30] mt-3">{updateMutation.error?.message}</p>
        )}
      </Modal>
    </div>
  )
}
