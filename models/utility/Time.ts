export function getTimeString(time: number) {
	// Calculate days, hours, minutes, and seconds
	const remainingDays = Math.floor(time / (24 * 3600));
	const remainingHours = Math.floor((time % (24 * 3600)) / 3600);
	const remainingMinutes = Math.floor((time % 3600) / 60);
	const remainingSeconds = Math.floor(time % 60);

	// Format components with leading zeros
	const formattedDays = remainingDays.toString();
	const formattedHours = remainingHours.toString().padStart(2, '0');
	const formattedMinutes = remainingMinutes.toString().padStart(2, '0');
	const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

	if (time < 60) {
		return `${time} seconds`;
	} else if (time < 3600) {
		return `${remainingMinutes}:${formattedSeconds}`;
	} else if (time < 3600 * 24) {
		return `${remainingHours}:${formattedMinutes}:${formattedSeconds}`;
	} else {
		return `${formattedDays}d ${formattedHours}:${formattedMinutes}`;
	}
}