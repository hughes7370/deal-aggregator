{/* Desktop Table View */}
<div className="hidden sm:block">
  <table className="min-w-full table-fixed divide-y divide-gray-200">
    <thead>
      <tr>
        <th className="w-8 px-2 py-2 bg-gray-50">
          <input
            type="checkbox"
            checked={selectedItems.size === filteredListings.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </th>
        {[
          { key: 'business_name', label: 'Business Name', width: 'w-1/4' },
          { key: 'asking_price', label: 'Price', width: 'w-24' },
          { key: 'business_type', label: 'Type', width: 'w-24' },
          { key: 'status', label: 'Status', width: 'w-28' },
          { key: 'next_steps', label: 'Next Steps', width: 'w-32' },
          { key: 'priority', label: 'Priority', width: 'w-24' },
          { key: 'notes', label: 'Notes', width: 'w-48' },
          { key: 'last_updated', label: 'Updated', width: 'w-24' },
          { key: 'source_platform', label: 'Source', width: 'w-24' },
          { key: 'created_at', label: 'Added', width: 'w-24' },
        ].map(({ key, label, width }) => (
          <th
            key={key}
            onClick={() => handleSort(key as SortField)}
            className={`${width} px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 truncate`}
          >
            <div className="flex items-center space-x-1">
              <span>{label}</span>
              {sortConfig.field === key && (
                <ArrowsUpDownIcon
                  className={`h-3 w-3 ${
                    sortConfig.direction === 'asc' ? 'transform rotate-180' : ''
                  }`}
                />
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {isLoading ? (
        <tr>
          <td colSpan={10} className="px-3 py-2 text-center text-sm text-gray-500">
            Loading...
          </td>
        </tr>
      ) : filteredListings.length === 0 ? (
        <tr>
          <td colSpan={10} className="px-3 py-2 text-center text-sm text-gray-500">
            No saved listings found. Save listings from the Deal Flow page to track them here.
          </td>
        </tr>
      ) : (
        filteredListings.map((savedListing) => (
          <DealRow
            key={savedListing.listings.id}
            listing={savedListing.listings}
            dealTracker={savedListing.deal_tracker}
            onUpdate={handleUpdateDeal}
            isSelected={selectedItems.has(savedListing.listings.id)}
            onSelect={(checked) => handleSelectItem(savedListing.listings.id, checked)}
            statusColor={getStatusColor(savedListing.deal_tracker?.status)}
          />
        ))
      )}
    </tbody>
  </table>
</div> 