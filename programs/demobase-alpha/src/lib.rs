use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod demobase_alpha {
    use super::*;

    pub fn create_collection(ctx: Context<CreateCollection>) -> ProgramResult {
        msg!("Create collection");
        ctx.accounts.collection.count = 0;
        ctx.accounts.collection.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn create_document(ctx: Context<CreateDocument>, content: String) -> ProgramResult {
        msg!("Create document");
        ctx.accounts.collection.count += 1;
        ctx.accounts.document.content = parse_content(content);
        ctx.accounts.document.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn update_document(ctx: Context<UpdateDocument>, content: String) -> ProgramResult {
        msg!("Update document");
        ctx.accounts.document.content = parse_content(content);
        Ok(())
    }

    pub fn delete_document(ctx: Context<DeleteDocument>) -> ProgramResult {
        msg!("Delete document");
        ctx.accounts.collection.count -= 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateCollection<'info> {
    #[account(init, payer = authority, space = 8 + 40, has_one = authority)]
    pub collection: Account<'info, Collection>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateDocument<'info> {
    #[account(init, payer = authority, space = 8 + 64, has_one = authority)]
    pub document: Account<'info, Document>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account()]
    pub collection: Account<'info, Collection>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateDocument<'info> {
    #[account(mut, has_one = authority)]
    pub document: Account<'info, Document>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account()]
    pub collection: Account<'info, Collection>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeleteDocument<'info> {
    #[account(mut, close = authority, has_one = authority)]
    pub document: Account<'info, Document>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account()]
    pub collection: Account<'info, Collection>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Collection {
    pub authority: Pubkey,
    pub count: u64,
}

#[account]
pub struct Document {
    pub authority: Pubkey,
    pub content: [u8; 32],
}

pub fn parse_content(content: String) -> [u8; 32] {
    let src = content.as_bytes();
    let mut data = [0u8; 32];
    data[..src.len()].copy_from_slice(src);
    return data;
}
