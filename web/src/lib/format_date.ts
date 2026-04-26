export const formatDate = (dateString: string) => {
	if (!dateString) return "-";
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
		timeZone: "Asia/Singapore",
	})
		.format(new Date(dateString))
		.replace(",", "");
};
