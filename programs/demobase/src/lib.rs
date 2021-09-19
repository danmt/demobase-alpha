use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod demobase {
    use super::*;

    pub fn create_application(ctx: Context<CreateApplication>, name: String) -> ProgramResult {
        msg!("Create application");
        ctx.accounts.application.count = 0;
        ctx.accounts.application.name = parse_string(name);
        ctx.accounts.application.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn create_collection(ctx: Context<CreateCollection>, name: String, bump: u8) -> ProgramResult {
        msg!("Create collection");
        ctx.accounts.application.count += 1;
        ctx.accounts.collection.count = 0;
        ctx.accounts.collection.bump = bump;
        ctx.accounts.collection.name = parse_string(name);
        ctx.accounts.collection.authority = ctx.accounts.authority.key();
        ctx.accounts.collection.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn create_document(ctx: Context<CreateDocument>, id: String, content: String, bump: u8) -> ProgramResult {
        msg!("Create document");
        ctx.accounts.collection.count += 1;
        ctx.accounts.document.id = parse_string(id);
        ctx.accounts.document.content = parse_string(content);
        ctx.accounts.document.bump = bump;
        ctx.accounts.document.authority = ctx.accounts.authority.key();
        ctx.accounts.document.application = ctx.accounts.application.key();
        ctx.accounts.document.collection = ctx.accounts.collection.key();
        Ok(())
    }

    pub fn update_document(ctx: Context<UpdateDocument>, content: String) -> ProgramResult {
        msg!("Update document");
        ctx.accounts.document.content = parse_string(content);
        Ok(())
    }

    pub fn delete_document(ctx: Context<DeleteDocument>) -> ProgramResult {
        msg!("Delete document");
        ctx.accounts.collection.count -= 1;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateApplication<'info> {
    #[account(
        init, 
        payer = authority, 
        space = 8 + 32 + 8 + 32, 
    )]
    pub application: Box<Account<'info, Application>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, bump: u8)]
pub struct CreateCollection<'info> {
    #[account(
        init, 
        payer = authority, 
        space = 8 + 32 + 1 + 32 + 8 + 32, 
        seeds = [
            b"collection",
            name.as_bytes(),
            application.key().as_ref()
        ], 
        bump = bump
    )]
    pub collection: Box<Account<'info, Collection>>,
    #[account(mut)]
    pub application: Box<Account<'info, Application>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: String, content: String, bump: u8)]
pub struct CreateDocument<'info> {
    #[account(
        init, 
        payer = authority, 
        space = 8 + 32 + 1 + 32 + 32 + 32 + 32,
        seeds = [
            b"document", 
            id.as_bytes(),
            application.key().as_ref(),
            collection.key().as_ref()
        ], 
        bump = bump
    )]
    pub document: Box<Account<'info, Document>>,
    pub application: Box<Account<'info, Application>>,
    #[account(mut)]
    pub collection: Box<Account<'info, Collection>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateDocument<'info> {
    #[account(mut, has_one = authority)]
    pub document: Box<Account<'info, Document>>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeleteDocument<'info> {
    #[account(mut, close = authority, has_one = authority)]
    pub document: Account<'info, Document>,
    #[account(mut)]
    pub collection: Box<Account<'info, Collection>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Application {
    pub authority: Pubkey,
    pub count: u64,
    pub name: [u8; 32],
}

#[account]
pub struct Collection {
    pub authority: Pubkey,
    pub bump: u8, 
    pub application: Pubkey,
    pub count: u64,
    pub name: [u8; 32],
}

#[account]
pub struct Document {
    pub authority: Pubkey,
    pub bump: u8,
    pub application: Pubkey,
    pub collection: Pubkey,
    pub content: [u8; 32],
    pub id: [u8; 32],
}

pub fn parse_string(string: String) -> [u8; 32] {
    let src = string.as_bytes();
    let mut data = [0u8; 32];
    data[..src.len()].copy_from_slice(src);
    return data;
}
