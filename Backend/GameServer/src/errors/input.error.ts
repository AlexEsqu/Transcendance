export { getJSONError }

/************************************************************************************************************
 * 		Declare ERROR interfaces																			*
 ***********************************************************************************************************/

interface IErrorMessage {
	error: Error | number;
	details: string;
};

/************************************************************************************************************
 * 		Declare error handler methods																		*
 ***********************************************************************************************************/

function getJSONError(details: string, error: number ): IErrorMessage
{
	const errorMessage: IErrorMessage = {
		error: error ?? 500,
		details: details
	};
	// const errorMessage: IErrorMessage = {
	// 	statusCode: error ?? 500,
	// 	error: error,
	// 	details: details
	// };
	return errorMessage;
}