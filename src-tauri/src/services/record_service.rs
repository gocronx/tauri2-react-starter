use crate::database::dao::record::{CreateRecordDto, RecordDao, RecordItem, UpdateRecordDto};
use crate::database::Database;
use crate::error::AppError;

pub struct RecordService;

impl RecordService {
    pub fn list_records(db: &Database, query: Option<&str>) -> Result<Vec<RecordItem>, AppError> {
        RecordDao::list(db, query)
    }

    pub fn get_record(db: &Database, id: &str) -> Result<Option<RecordItem>, AppError> {
        RecordDao::get(db, id)
    }

    pub fn create_record(db: &Database, dto: CreateRecordDto) -> Result<RecordItem, AppError> {
        if dto.title.trim().is_empty() {
            return Err(AppError::InvalidInput("Title cannot be empty".to_string()));
        }
        RecordDao::create(db, dto)
    }

    pub fn update_record(db: &Database, dto: UpdateRecordDto) -> Result<RecordItem, AppError> {
        if let Some(ref title) = dto.title {
            if title.trim().is_empty() {
                return Err(AppError::InvalidInput("Title cannot be empty".to_string()));
            }
        }
        RecordDao::update(db, dto)
    }

    pub fn delete_record(db: &Database, id: &str) -> Result<bool, AppError> {
        RecordDao::delete(db, id)
    }
}
