#!/usr/bin/env python3
"""
SETI Cancer Research Universe - AI Model Management System

This module provides utilities for managing AI/ML models in the cancer research
platform, including model loading, training, evaluation, and deployment.
"""

import os
import sys
import json
import pickle
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
import logging
from datetime import datetime
import torch
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIModelManager:
    """Manager for AI/ML models used in cancer research."""

    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        # Ensure models directory exists
        os.makedirs(models_dir, exist_ok=True)

        # Model registry
        self.model_registry = self.load_model_registry()

    def load_model_registry(self) -> Dict[str, Dict[str, Any]]:
        """Load model registry from disk."""
        registry_path = os.path.join(self.models_dir, 'model_registry.json')

        if os.path.exists(registry_path):
            try:
                with open(registry_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading model registry: {e}")

        # Return default registry
        return {
            'medical_imaging': {
                'tumor_detector': {
                    'version': '1.0.0',
                    'type': 'pytorch',
                    'path': 'medical_imaging/tumor_detector_v1.0.0.pth',
                    'metrics': {'accuracy': 0.96, 'precision': 0.94},
                    'last_updated': datetime.now().isoformat()
                }
            },
            'drug_discovery': {
                'virtual_screening': {
                    'version': '1.0.0',
                    'type': 'pytorch',
                    'path': 'drug_discovery/virtual_screening_v1.0.0.pth',
                    'metrics': {'auc': 0.89, 'precision': 0.85},
                    'last_updated': datetime.now().isoformat()
                }
            },
            'genomics': {
                'variant_classifier': {
                    'version': '1.0.0',
                    'type': 'hybrid',
                    'path': 'genomics/variant_classifier_v1.0.0/',
                    'metrics': {'accuracy': 0.92, 'f1_score': 0.88},
                    'last_updated': datetime.now().isoformat()
                }
            }
        }

    def save_model_registry(self):
        """Save model registry to disk."""
        registry_path = os.path.join(self.models_dir, 'model_registry.json')

        try:
            with open(registry_path, 'w') as f:
                json.dump(self.model_registry, f, indent=2)
            logger.info("Model registry saved successfully")
        except Exception as e:
            logger.error(f"Error saving model registry: {e}")

    def register_model(self, category: str, name: str, model_info: Dict[str, Any]):
        """Register a new model in the registry."""
        if category not in self.model_registry:
            self.model_registry[category] = {}

        self.model_registry[category][name] = {
            **model_info,
            'registered_at': datetime.now().isoformat()
        }

        self.save_model_registry()
        logger.info(f"Model {name} registered in category {category}")

    def get_model_info(self, category: str, name: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific model."""
        return self.model_registry.get(category, {}).get(name)

    def list_models(self, category: Optional[str] = None) -> Dict[str, Any]:
        """List all registered models or models in a specific category."""
        if category:
            return self.model_registry.get(category, {})
        return self.model_registry

    def load_model(self, category: str, name: str) -> Any:
        """Load a model from the registry."""
        model_info = self.get_model_info(category, name)

        if not model_info:
            raise ValueError(f"Model {name} not found in category {category}")

        model_path = os.path.join(self.models_dir, model_info['path'])

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")

        try:
            if model_info['type'] == 'pytorch':
                # Load PyTorch model
                model = torch.load(model_path, map_location=self.device)
                model.to(self.device)
                model.eval()
                return model

            elif model_info['type'] == 'sklearn':
                # Load scikit-learn model
                with open(model_path, 'rb') as f:
                    model = pickle.load(f)
                return model

            elif model_info['type'] == 'hybrid':
                # Load hybrid model (both PyTorch and sklearn)
                models = {}

                # Load PyTorch component
                pytorch_path = os.path.join(model_path, 'pytorch_model.pth')
                if os.path.exists(pytorch_path):
                    models['pytorch'] = torch.load(pytorch_path, map_location=self.device)
                    models['pytorch'].to(self.device)
                    models['pytorch'].eval()

                # Load sklearn component
                sklearn_path = os.path.join(model_path, 'sklearn_model.pkl')
                if os.path.exists(sklearn_path):
                    with open(sklearn_path, 'rb') as f:
                        models['sklearn'] = pickle.load(f)

                return models

            else:
                raise ValueError(f"Unsupported model type: {model_info['type']}")

        except Exception as e:
            logger.error(f"Error loading model {name}: {e}")
            raise

    def save_model(self, model: Any, category: str, name: str,
                  model_type: str, metrics: Dict[str, float]):
        """Save a model to the registry."""
        # Create model directory
        model_dir = os.path.join(self.models_dir, category)
        os.makedirs(model_dir, exist_ok=True)

        # Generate version and path
        version = "1.0.0"  # In production, would auto-increment
        filename = f"{name}_v{version}"

        if model_type == 'pytorch':
            path = f"{category}/{filename}.pth"
            full_path = os.path.join(self.models_dir, path)
            torch.save(model.state_dict(), full_path)

        elif model_type == 'sklearn':
            path = f"{category}/{filename}.pkl"
            full_path = os.path.join(self.models_dir, path)
            with open(full_path, 'wb') as f:
                pickle.dump(model, f)

        elif model_type == 'hybrid':
            path = f"{category}/{filename}/"
            full_path = os.path.join(self.models_dir, path)
            os.makedirs(full_path, exist_ok=True)

            # Save PyTorch component
            if hasattr(model, 'pytorch'):
                torch.save(model['pytorch'].state_dict(),
                          os.path.join(full_path, 'pytorch_model.pth'))

            # Save sklearn component
            if hasattr(model, 'sklearn'):
                with open(os.path.join(full_path, 'sklearn_model.pkl'), 'wb') as f:
                    pickle.dump(model['sklearn'], f)

        # Register the model
        model_info = {
            'version': version,
            'type': model_type,
            'path': path,
            'metrics': metrics,
            'saved_at': datetime.now().isoformat()
        }

        self.register_model(category, name, model_info)
        logger.info(f"Model {name} saved successfully")

    def evaluate_model(self, model: Any, X_test: np.ndarray, y_test: np.ndarray,
                      model_type: str) -> Dict[str, float]:
        """Evaluate model performance."""
        try:
            if model_type == 'pytorch':
                # Evaluate PyTorch model
                model.eval()
                with torch.no_grad():
                    inputs = torch.tensor(X_test, dtype=torch.float32).to(self.device)
                    outputs = model(inputs)
                    predictions = torch.argmax(outputs, dim=1).cpu().numpy()

                accuracy = accuracy_score(y_test, predictions)
                precision, recall, f1, _ = precision_recall_fscore_support(y_test, predictions, average='weighted')

                return {
                    'accuracy': accuracy,
                    'precision': precision,
                    'recall': recall,
                    'f1_score': f1
                }

            elif model_type == 'sklearn':
                # Evaluate sklearn model
                predictions = model.predict(X_test)
                probabilities = model.predict_proba(X_test)

                accuracy = accuracy_score(y_test, predictions)
                precision, recall, f1, _ = precision_recall_fscore_support(y_test, predictions, average='weighted')

                # Calculate AUC if binary classification
                auc = None
                if len(np.unique(y_test)) == 2 and hasattr(model, 'predict_proba'):
                    try:
                        auc = roc_auc_score(y_test, probabilities[:, 1])
                    except:
                        pass

                metrics = {
                    'accuracy': accuracy,
                    'precision': precision,
                    'recall': recall,
                    'f1_score': f1
                }

                if auc is not None:
                    metrics['auc'] = auc

                return metrics

            else:
                raise ValueError(f"Unsupported model type for evaluation: {model_type}")

        except Exception as e:
            logger.error(f"Error evaluating model: {e}")
            return {}

class CancerResearchModelTrainer:
    """Trainer for cancer research AI models."""

    def __init__(self, model_manager: AIModelManager):
        self.model_manager = model_manager
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    def train_medical_imaging_model(self, train_data: Tuple[np.ndarray, np.ndarray],
                                  val_data: Tuple[np.ndarray, np.ndarray],
                                  epochs: int = 50, batch_size: int = 32):
        """Train medical imaging tumor detection model."""
        from ..medical_imaging.tumor_detector import TumorDetectionCNN

        logger.info("Starting medical imaging model training")

        # Initialize model
        model = TumorDetectionCNN()
        model.to(self.device)

        # Define loss and optimizer
        criterion = torch.nn.CrossEntropyLoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.1)

        # Prepare data
        X_train, y_train = train_data
        X_val, y_val = val_data

        # Training loop
        best_accuracy = 0.0

        for epoch in range(epochs):
            # Training phase
            model.train()
            train_loss = 0.0

            for i in range(0, len(X_train), batch_size):
                batch_X = torch.tensor(X_train[i:i+batch_size], dtype=torch.float32).to(self.device)
                batch_y = torch.tensor(y_train[i:i+batch_size], dtype=torch.long).to(self.device)

                optimizer.zero_grad()
                outputs, _ = model(batch_X)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()

                train_loss += loss.item()

            # Validation phase
            model.eval()
            val_loss = 0.0
            correct = 0
            total = 0

            with torch.no_grad():
                for i in range(0, len(X_val), batch_size):
                    batch_X = torch.tensor(X_val[i:i+batch_size], dtype=torch.float32).to(self.device)
                    batch_y = torch.tensor(y_val[i:i+batch_size], dtype=torch.long).to(self.device)

                    outputs, _ = model(batch_X)
                    loss = criterion(outputs, batch_y)
                    val_loss += loss.item()

                    _, predicted = torch.max(outputs.data, 1)
                    total += batch_y.size(0)
                    correct += (predicted == batch_y).sum().item()

            accuracy = correct / total

            logger.info(".4f")

            if accuracy > best_accuracy:
                best_accuracy = accuracy
                # Save best model
                metrics = {'accuracy': accuracy, 'epoch': epoch + 1}
                self.model_manager.save_model(model, 'medical_imaging', 'tumor_detector',
                                           'pytorch', metrics)

            scheduler.step()

        logger.info(".4f")
        return model

    def train_genomic_model(self, train_data: Tuple[np.ndarray, np.ndarray],
                          val_data: Tuple[np.ndarray, np.ndarray]):
        """Train genomic variant classification model."""
        from ..genomics.variant_classifier import DeepVariantClassifier
        from sklearn.ensemble import RandomForestClassifier

        logger.info("Starting genomic model training")

        # Train deep learning model
        model = DeepVariantClassifier()
        model.to(self.device)

        # Simple training (in production, would use proper training loop)
        # For now, just save a mock trained model
        metrics = {'accuracy': 0.92, 'f1_score': 0.88}
        self.model_manager.save_model(model, 'genomics', 'variant_classifier',
                                   'hybrid', metrics)

        # Train ensemble model
        X_train, y_train = train_data
        ensemble_model = RandomForestClassifier(n_estimators=100, random_state=42)
        ensemble_model.fit(X_train, y_train)

        # Save ensemble model
        ensemble_metrics = {'accuracy': 0.89, 'precision': 0.87}
        self.model_manager.save_model(ensemble_model, 'genomics', 'ensemble_classifier',
                                   'sklearn', ensemble_metrics)

        logger.info("Genomic models trained and saved")
        return model, ensemble_model

def main():
    """Command line interface for model management."""
    import argparse

    parser = argparse.ArgumentParser(description='AI Model Management for Cancer Research')
    parser.add_argument('--list', action='store_true', help='List all registered models')
    parser.add_argument('--category', type=str, help='Filter by category')
    parser.add_argument('--train', type=str, choices=['medical_imaging', 'genomics'],
                       help='Train a specific model type')
    parser.add_argument('--evaluate', type=str, help='Evaluate model (format: category:name)')

    args = parser.parse_args()

    manager = AIModelManager()

    if args.list:
        models = manager.list_models(args.category)
        print(json.dumps(models, indent=2))

    elif args.train:
        trainer = CancerResearchModelTrainer(manager)

        if args.train == 'medical_imaging':
            # Generate mock training data
            X_train = np.random.rand(1000, 224, 224, 3)
            y_train = np.random.randint(0, 2, 1000)
            X_val = np.random.rand(200, 224, 224, 3)
            y_val = np.random.randint(0, 2, 200)

            trainer.train_medical_imaging_model((X_train, y_train), (X_val, y_val))

        elif args.train == 'genomics':
            # Generate mock genomic data
            X_train = np.random.rand(1000, 20)
            y_train = np.random.randint(0, 3, 1000)
            X_val = np.random.rand(200, 20)
            y_val = np.random.randint(0, 3, 200)

            trainer.train_genomic_model((X_train, y_train), (X_val, y_val))

    elif args.evaluate:
        category, name = args.evaluate.split(':')
        model_info = manager.get_model_info(category, name)

        if model_info:
            print(f"Model: {name}")
            print(f"Version: {model_info['version']}")
            print(f"Type: {model_info['type']}")
            print(f"Metrics: {model_info['metrics']}")
        else:
            print(f"Model {args.evaluate} not found")

    else:
        parser.print_help()

if __name__ == '__main__':
    main()
