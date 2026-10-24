import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from backend.app.core.database import get_db, init_db
from backend.app.core.config import settings
from backend.app.schemas.system import HealthResponse, ConfigStatusResponse
from backend.app.models.repository import Repository
from backend.app.models.specification import ApiSpecification
from backend.app.models.scan import Scan
from backend.app.models.detected_change import DetectedChange
from backend.app.models.affected_file import AffectedFile
from backend.app.models.repair_attempt import RepairAttempt
from backend.app.models.proposed_patch import ProposedPatch
from backend.app.models.test_run import TestRun
from backend.app.models.pull_request import PullRequestRecord
from backend.app.models.monitoring import MonitoringConfiguration
from backend.app.services.monitoring import monitoring_service
from backend.app.services.openapi_diff import OpenAPIDiffEngine
from backend.app.services.code_impact import CodeImpactAnalyzer
from backend.app.services.ai_repair import AIRepairService

router = APIRouter(prefix="/system", tags=["System"])

@router.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.query(Repository).count()
    except Exception as e:
        db_status = f"error: {str(e)}"

    scheduler_status = "running" if monitoring_service.scheduler.running else "stopped"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "version": "1.0.0",
        "database": db_status,
        "scheduler": scheduler_status,
        "tagline": settings.TAGLINE
    }

@router.get("/config/status", response_model=ConfigStatusResponse)
def get_config_status():
    return {
        "llm_provider": settings.LLM_PROVIDER,
        "llm_configured": bool(
            settings.LLM_PROVIDER == "mock" or
            (settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY) or
            (settings.LLM_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY) or
            (settings.LLM_PROVIDER == "gemini" and settings.GEMINI_API_KEY)
        ),
        "github_app_configured": bool(settings.GITHUB_APP_ID and settings.GITHUB_APP_PRIVATE_KEY),
        "github_pat_configured": bool(settings.GITHUB_ACCESS_TOKEN),
        "developer_approval_required": settings.REQUIRE_DEVELOPER_APPROVAL,
        "database_path": settings.DATABASE_URL,
        "demo_repos_path": str(settings.DEMO_REPOS_DIR),
        "sandbox_path": str(settings.SANDBOX_DIR)
    }

@router.post("/seed-demo")
async def seed_demo_data(db: Session = Depends(get_db)):
    """
    Populates full demonstration dataset linking OpenAPI v1 vs v2,
    code impact analysis against payment-service-py, AI repair proposal,
    test verification, and pull request tracking.
    """
    init_db()

    # 1. Register demo repository
    repo = db.query(Repository).filter(Repository.name == "payment-service-py").first()
    if not repo:
        repo = Repository(
            name="payment-service-py",
            full_name="demo/payment-service-py",
            clone_url=f"file:///{settings.DEMO_REPOS_DIR / 'payment-service-py'}",
            default_branch="main",
            is_demo=True,
            local_path=str(settings.DEMO_REPOS_DIR / "payment-service-py")
        )
        db.add(repo)
        db.commit()
        db.refresh(repo)

    # 2. Add OpenAPI v1 (previous)
    spec_v1_dict = {
        "openapi": "3.0.0",
        "info": {"title": "Store Payment API", "version": "1.0.0"},
        "paths": {
            "/v1/items": {
                "get": {
                    "summary": "List store items",
                    "responses": {
                        "200": {
                            "description": "Item list",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "items": {
                                                "type": "array",
                                                "items": {
                                                    "type": "object",
                                                    "properties": {
                                                        "id": {"type": "integer"},
                                                        "name": {"type": "string"},
                                                        "status": {"type": "string", "enum": ["active", "archived", "draft"]}
                                                    },
                                                    "required": ["id", "name", "status"]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "delete": {
                    "summary": "Delete store item",
                    "parameters": [{"name": "id", "in": "query", "required": True, "schema": {"type": "integer"}}],
                    "responses": {"204": {"description": "Item deleted"}}
                }
            },
            "/v1/legacy": {
                "get": {
                    "summary": "Legacy data sync",
                    "responses": {"200": {"description": "OK"}}
                }
            }
        }
    }

    spec_v1 = db.query(ApiSpecification).filter(ApiSpecification.name == "Store Payment API", ApiSpecification.version == "1.0.0").first()
    if not spec_v1:
        spec_v1 = ApiSpecification(
            name="Store Payment API",
            version="1.0.0",
            content_json=json.dumps(spec_v1_dict),
            format="json",
            source_type="upload"
        )
        db.add(spec_v1)
        db.commit()
        db.refresh(spec_v1)

    # 3. Add OpenAPI v2 (current)
    spec_v2_dict = {
        "openapi": "3.0.0",
        "info": {"title": "Store Payment API", "version": "2.0.0"},
        "paths": {
            "/v1/items": {
                "get": {
                    "summary": "List store items v2",
                    "parameters": [
                        {"name": "api_token", "in": "query", "required": True, "schema": {"type": "string"}}
                    ],
                    "responses": {
                        "200": {
                            "description": "Item list",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "items": {
                                                "type": "array",
                                                "items": {
                                                    "type": "object",
                                                    "properties": {
                                                        "id": {"type": "integer"},
                                                        # 'name' removed
                                                        "status": {"type": "string", "enum": ["active", "archived"]}
                                                    },
                                                    "required": ["id"]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                # DELETE /v1/items removed
            }
            # /v1/legacy removed
        }
    }

    spec_v2 = db.query(ApiSpecification).filter(ApiSpecification.name == "Store Payment API", ApiSpecification.version == "2.0.0").first()
    if not spec_v2:
        spec_v2 = ApiSpecification(
            name="Store Payment API",
            version="2.0.0",
            content_json=json.dumps(spec_v2_dict),
            format="json",
            source_type="upload"
        )
        db.add(spec_v2)
        db.commit()
        db.refresh(spec_v2)

    # 4. Trigger Scan
    scan = db.query(Scan).filter(Scan.previous_spec_id == spec_v1.id, Scan.current_spec_id == spec_v2.id).first()
    if not scan:
        engine = OpenAPIDiffEngine()
        changes = engine.compare_specs(spec_v1_dict, spec_v2_dict)
        breaking = [c for c in changes if c["severity"] == "BREAKING"]
        warnings = [c for c in changes if c["severity"] == "WARNING"]
        infos = [c for c in changes if c["severity"] == "INFO"]

        scan = Scan(
            repository_id=repo.id,
            previous_spec_id=spec_v1.id,
            current_spec_id=spec_v2.id,
            status="succeeded",
            total_changes=len(changes),
            breaking_changes=len(breaking),
            warnings=len(warnings),
            infos=len(infos)
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        persisted_changes = []
        for c in changes:
            det = DetectedChange(
                scan_id=scan.id,
                change_type=c["change_type"],
                severity=c["severity"],
                path=c["path"],
                http_method=c["http_method"],
                description=c["description"],
                rule_code=c["rule_code"],
                old_value=c.get("old_value"),
                new_value=c.get("new_value"),
                evidence_json=json.dumps(c.get("evidence", {})),
                status="detected"
            )
            db.add(det)
            persisted_changes.append(det)
        db.commit()

        # 5. Connect Code Impact on the primary change (Response property 'name' removed)
        primary_change = next((dc for dc in persisted_changes if dc.change_type == "RESPONSE_PROPERTY_REMOVED"), persisted_changes[0])
        
        # Load repo file client.py
        client_file = settings.DEMO_REPOS_DIR / "payment-service-py" / "client.py"
        if client_file.exists():
            files_dict = {"client.py": client_file.read_text(encoding="utf-8")}
            analyzer = CodeImpactAnalyzer()
            matches = analyzer.analyze_repository(files_dict, {
                "change_type": primary_change.change_type,
                "path": primary_change.path,
                "http_method": primary_change.http_method,
                "description": primary_change.description,
                "rule_code": primary_change.rule_code
            })

            persisted_affs = []
            for m in matches:
                aff = AffectedFile(
                    detected_change_id=primary_change.id,
                    repository_id=repo.id,
                    file_path=m["file_path"],
                    language=m["language"],
                    function_name=m["function_name"],
                    line_start=m["line_start"],
                    line_end=m["line_end"],
                    match_confidence=m["match_confidence"],
                    snippet=m["snippet"],
                    context_reason=m["context_reason"]
                )
                db.add(aff)
                persisted_affs.append(aff)
            primary_change.status = "analyzed"
            db.commit()

            # 6. Generate Repair Proposal
            repair_service = AIRepairService(provider_name="mock")
            repair_result = await repair_service.generate_repair(
                {"change_type": primary_change.change_type, "path": primary_change.path, "description": primary_change.description},
                [{"file_path": a.file_path, "language": a.language, "line_start": a.line_start, "line_end": a.line_end} for a in persisted_affs],
                files_dict
            )

            repair = RepairAttempt(
                detected_change_id=primary_change.id,
                status="approved",
                provider="mock",
                model_name="rule-repair-engine-v1",
                explanation=repair_result["explanation"],
                reasoning=repair_result["reasoning"],
                known_risks=repair_result["known_risks"],
                developer_approved=True
            )
            db.add(repair)
            db.commit()
            db.refresh(repair)

            for p in repair_result["patches"]:
                patch = ProposedPatch(
                    repair_attempt_id=repair.id,
                    file_path=p["file_path"],
                    original_content=p["original_content"],
                    patched_content=p["patched_content"],
                    unified_diff=p["unified_diff"],
                    is_valid=p["is_valid"]
                )
                db.add(patch)
            db.commit()

            # 7. Add baseline test run
            test_run = TestRun(
                repair_attempt_id=repair.id,
                repository_id=repo.id,
                command="python -m pytest",
                exit_code=0,
                stdout="test_client.py .. [100%]\n2 passed in 0.45s",
                stderr="",
                duration_seconds=0.45,
                status="passed",
                total_tests=2,
                passed_tests=2,
                failed_tests=0
            )
            db.add(test_run)
            db.commit()

            # 8. Create mock demo Pull Request
            pr = PullRequestRecord(
                repair_attempt_id=repair.id,
                repository_id=repo.id,
                pr_number=101,
                pr_url="https://github.com/demo/payment-service-py/pull/101#demo-mode",
                branch_name="bump/repair-change-1",
                base_branch="main",
                title="fix(api): adapt client for RESPONSE_PROPERTY_REMOVED on /v1/items",
                body="Automated repair adapting client code for OpenAPI 2.0 changes.",
                status="created"
            )
            db.add(pr)
            primary_change.status = "pr_created"
            db.commit()

    # 9. Register a demo monitoring schedule
    mon = db.query(MonitoringConfiguration).filter(MonitoringConfiguration.name == "Payment API Monitor").first()
    if not mon:
        mon = MonitoringConfiguration(
            repository_id=repo.id,
            name="Payment API Monitor",
            api_spec_url="https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.json",
            schedule_cron="0 */6 * * *",
            interval_minutes=60,
            is_active=True,
            webhook_secret="demo-secret-key-12345"
        )
        db.add(mon)
        db.commit()

    return {"status": "seeded", "repository_id": repo.id, "scan_id": scan.id}
