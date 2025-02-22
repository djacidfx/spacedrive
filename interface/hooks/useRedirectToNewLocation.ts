import { useNavigate } from 'react-router';
import { useLibraryQuery } from '@sd/client';
import { getExplorerStore, useExplorerStore } from '~/app/$libraryId/Explorer/store';

import { LibraryIdParamsSchema } from '../app/route-schemas';
import { useZodRouteParams } from './useZodRouteParams';

/**
 * When a user adds a location and checks the should redirect box,
 * this hook will redirect them to the location
 * once the indexer has been invoked
 */

export const useRedirectToNewLocation = () => {
	const navigate = useNavigate();
	const { libraryId } = useZodRouteParams(LibraryIdParamsSchema);
	const { newLocationToRedirect: newLocation } = useExplorerStore();
	const { data: jobGroups } = useLibraryQuery(['jobs.reports'], {
		enabled: newLocation != null,
		refetchOnWindowFocus: false
	});

	const hasIndexerJob = jobGroups
		?.flatMap((j) => j.jobs)
		.some(
			(j) =>
				j.name === 'indexer' &&
				(j.metadata as any)?.location.id === newLocation &&
				(j.completed_task_count > 0 || j.completed_at != null)
		);

	if (hasIndexerJob) {
		navigate(`/${libraryId}/location/${newLocation}`);
		getExplorerStore().newLocationToRedirect = null;
	}
};
