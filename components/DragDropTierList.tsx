"use client";

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import RowHandle from '../components/RowHandle';
import EditableLabel from '../components/EditableLabel';

interface Item {
  id: string;
  content: string;
}

interface Tier {
  id: string;
  name: string;
  items: Item[];
  labelPosition?: 'top' | 'left' | 'right';
}

interface DragDropTierListProps {
  initialTiers: Tier[];
}

const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const DragDropTierList: React.FC<DragDropTierListProps> = ({ initialTiers }) => {
  const [tiers, setTiers] = useState(initialTiers);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) {
      return;
    }

    if (type === 'TIER') {
      const sourceItems = tiers[source.index].items;
      const destinationItems = tiers[destination.index].items;
      const newTiers = tiers.map((tier, index) => {
        if (index === source.index) {
          return { ...tier, items: destinationItems };
        }
        if (index === destination.index) {
          return { ...tier, items: sourceItems };
        }
        return tier;
      });
      setTiers(newTiers);
      return;
    }

    const sourceTier = tiers.find(tier => tier.id === source.droppableId);
    const destTier = tiers.find(tier => tier.id === destination.droppableId);

    if (sourceTier && destTier) {
      if (source.droppableId === destination.droppableId) {
        const items = reorder(sourceTier.items, source.index, destination.index);
        const newTiers = tiers.map(tier => tier.id === source.droppableId ? { ...tier, items } : tier);
        setTiers(newTiers);
      } else {
        const sourceClone = Array.from(sourceTier.items);
        const destClone = Array.from(destTier.items);
        const [removed] = sourceClone.splice(source.index, 1);
        destClone.splice(destination.index, 0, removed);

        const newTiers = tiers.map(tier => {
          if (tier.id === source.droppableId) {
            return { ...tier, items: sourceClone };
          }
          if (tier.id === destination.droppableId) {
            return { ...tier, items: destClone };
          }
          return tier;
        });
        setTiers(newTiers);
      }
    }
  };

  const handleSaveLabel = (index: number, newText: string) => {
    const newTiers = tiers.map((tier, i) => (i === index ? { ...tier, name: newText } : tier));
    setTiers(newTiers);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-tiers" direction="vertical" type="TIER">
        {(provided) => (
          <div className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
            {tiers.map((tier, index) => {
              const labelPosition = tier.labelPosition || 'left';
              return (
                <Draggable draggableId={tier.id} index={index} key={tier.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-gray-800 p-4 rounded-md min-w-full sm:min-w-[500px] md:min-w-[600px] lg:min-w-[800px] flex items-center"
                    >
                      <div className="flex-1">
                        {labelPosition === 'top' && (
                          <EditableLabel text={tier.name} onSave={(newText) => handleSaveLabel(index, newText)} />
                        )}
                        <div className={`flex ${labelPosition === 'left' ? 'flex-row' : labelPosition === 'right' ? 'flex-row-reverse' : 'flex-col'} items-center`}>
                          {(labelPosition === 'left' || labelPosition === 'right') && (
                            <EditableLabel text={tier.name} onSave={(newText) => handleSaveLabel(index, newText)} className="m-4" />
                          )}
                          <Droppable droppableId={tier.id} direction="horizontal">
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`w-full flex p-2 rounded-md ${snapshot.isDraggingOver ? 'bg-gray-700' : 'bg-gray-600'}`}
                              >
                                {tier.items.map((item, index) => (
                                  <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`p-4 m-1 rounded-md bg-gray-500 ${snapshot.isDragging ? 'bg-gray-400' : ''}`}
                                      >
                                        {item.content}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      </div>
                      <RowHandle dragHandleProps={provided.dragHandleProps} />
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DragDropTierList;