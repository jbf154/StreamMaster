import { findDifferenceStationIdLineUps } from '@lib/common/common';
import {
  StationIdLineup,
  UpdateSettingRequest,
  useSchedulesDirectGetSelectedStationIdsQuery,
  useSchedulesDirectGetStationPreviewsQuery,
  type StationPreview
} from '@lib/iptvApi';
import { useSelectedItems } from '@lib/redux/slices/useSelectedItemsSlice';
import { UpdateSetting } from '@lib/smAPI/Settings/SettingsMutateAPI';
import { Toast } from 'primereact/toast';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DataSelector from '../dataSelector/DataSelector';
import { type ColumnMeta } from '../dataSelector/DataSelectorTypes';
import { useLineUpColumnConfig } from '@components/columns/useLineUpColumnConfig';

const SchedulesDirectStationPreviewDataSelector = () => {
  const toast = useRef<Toast>(null);

  const { selectSelectedItems, setSelectSelectedItems } = useSelectedItems<StationPreview>('SchedulesDirectSchedulesDataSelector');

  const schedulesDirectGetSelectedStationIdsQuery = useSchedulesDirectGetSelectedStationIdsQuery();
  const stationPreviews = useSchedulesDirectGetStationPreviewsQuery();
  const [isLoading, setIsLoading] = useState(false);

  const { columnConfig: lineUpColumnConfig } = useLineUpColumnConfig();

  useEffect(() => {
    if (
      schedulesDirectGetSelectedStationIdsQuery.isLoading ||
      schedulesDirectGetSelectedStationIdsQuery.data === undefined ||
      stationPreviews.data === undefined
    ) {
      return;
    }

    const sp = schedulesDirectGetSelectedStationIdsQuery.data
      .map((stationIdLineUp) =>
        stationPreviews.data?.find(
          (stationPreview) => stationPreview.stationId === stationIdLineUp.stationId && stationPreview.lineup === stationIdLineUp.lineup
        )
      )
      .filter((station) => station !== undefined) as StationPreview[];

    if (findDifferenceStationIdLineUps(sp, selectSelectedItems).length > 0) {
      setSelectSelectedItems(sp as StationPreview[]);
    }
  }, [
    schedulesDirectGetSelectedStationIdsQuery.data,
    schedulesDirectGetSelectedStationIdsQuery.isLoading,
    selectSelectedItems,
    setSelectSelectedItems,
    stationPreviews.data
  ]);

  const onSave = useCallback(
    (stationIdLineUps: StationIdLineup[]) => {
      if (stationIdLineUps === undefined || schedulesDirectGetSelectedStationIdsQuery.data === undefined) {
        return;
      }
      const test = findDifferenceStationIdLineUps(schedulesDirectGetSelectedStationIdsQuery.data, stationIdLineUps);
      if (test.length === 0) {
        return;
      }
      setIsLoading(true);
      console.log('loading');
      const newData = {} as UpdateSettingRequest;

      newData.sdStationIds = stationIdLineUps;

      UpdateSetting(newData)
        .then(() => {
          setIsLoading(false);
          if (toast.current) {
            toast.current.show({
              detail: 'Update Station Ids Successful',
              life: 3000,
              severity: 'success',
              summary: 'Successful'
            });
          }
        })
        .catch(() => {
          setIsLoading(false);
          if (toast.current) {
            toast.current.show({
              detail: 'Update Station Ids Failed',
              life: 3000,
              severity: 'error',
              summary: 'Error'
            });
          }
        });

      console.log('done');
    },
    [schedulesDirectGetSelectedStationIdsQuery.data]
  );

  function imageBodyTemplate(data: StationPreview) {
    if (!data?.logo || data.logo.URL === '') {
      return <div />;
    }

    return (
      <div className="flex flex-nowrap justify-content-center align-items-center p-0">
        <img alt={data.logo.URL ?? 'Logo'} className="max-h-1rem max-w-full p-0" src={`${encodeURI(data.logo.URL ?? '')}`} />
      </div>
    );
  }

  const columns = useMemo((): ColumnMeta[] => {
    const columnConfigs: ColumnMeta[] = [
      { field: 'stationId', filter: true, header: 'Station Id', sortable: true, width: '18rem' },
      { bodyTemplate: imageBodyTemplate, field: 'logo', fieldType: 'image' }
    ];
    // // columnConfigs.push(channelGroupConfig);
    columnConfigs.push(lineUpColumnConfig);
    columnConfigs.push({ field: 'name', filter: true, header: 'Name', sortable: true });
    columnConfigs.push({ field: 'callsign', filter: true, header: 'Call Sign', sortable: true });
    columnConfigs.push({ field: 'affiliate', filter: true, header: 'Affiliate', sortable: true });

    return columnConfigs;
  }, [lineUpColumnConfig]);

  return (
    <>
      <Toast position="bottom-right" ref={toast} />
      <div className="m3uFilesEditor flex flex-column border-2 border-round surface-border w-full p-0">
        <DataSelector
          columns={columns}
          dataSource={stationPreviews.data}
          defaultSortField="name"
          disableSelectAll
          emptyMessage="No Line Ups"
          headerName="Line Up Preview"
          id="SchedulesDirectStationPreviewDataSelector"
          isLoading={stationPreviews.isLoading || isLoading}
          onSelectionChange={(e) => {
            onSave(e);
          }}
          selectedItemsKey="SchedulesDirectSchedulesDataSelector"
          selectionMode="multiple"
          showSelections
          style={{ height: 'calc(100vh - 60px)' }}
        />
      </div>
    </>
  );
};

SchedulesDirectStationPreviewDataSelector.displayName = 'SchedulesDirectStationPreviewDataSelector';

export default memo(SchedulesDirectStationPreviewDataSelector);
