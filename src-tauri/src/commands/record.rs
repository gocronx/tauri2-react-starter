use crate::database::dao::record::{CreateRecordDto, RecordItem, UpdateRecordDto};
use crate::database::Database;
use crate::error::AppError;
use crate::services::record_service::RecordService;
use tauri::{command, State};

#[command]
#[specta::specta]
pub fn list_records(
    db: State<'_, Database>,
    query: Option<String>,
) -> Result<Vec<RecordItem>, AppError> {
    RecordService::list_records(&db, query.as_deref())
}

#[command]
#[specta::specta]
pub fn get_record(db: State<'_, Database>, id: String) -> Result<Option<RecordItem>, AppError> {
    RecordService::get_record(&db, &id)
}

#[command]
#[specta::specta]
pub fn create_record(
    db: State<'_, Database>,
    dto: CreateRecordDto,
) -> Result<RecordItem, AppError> {
    RecordService::create_record(&db, dto)
}

#[command]
#[specta::specta]
pub fn update_record(
    db: State<'_, Database>,
    dto: UpdateRecordDto,
) -> Result<RecordItem, AppError> {
    RecordService::update_record(&db, dto)
}

#[command]
#[specta::specta]
pub fn delete_record(db: State<'_, Database>, id: String) -> Result<bool, AppError> {
    RecordService::delete_record(&db, &id)
}
